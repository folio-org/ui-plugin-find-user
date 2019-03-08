import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import { FormattedMessage } from 'react-intl';
import { IntlConsumer, AppIcon } from '@folio/stripes/core';
import {
  Button,
  MultiColumnList,
  SearchField,
  Paneset,
  Pane,
} from '@folio/stripes/components';

import {
  SearchAndSortQuery,
  makeQueryFunction,
  makeConnectedSource,
  StripesConnectedSource,
  SearchAndSortNoResultsMessage,
} from '@folio/stripes/smart-components';

import Filters from './Filters';
import filterConfig from './filterConfig';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

function getFullName(user) {
  const lastName = get(user, ['personal', 'lastName'], '');
  const firstName = get(user, ['personal', 'firstName'], '');
  const middleName = get(user, ['personal', 'middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

class UserSearchContainer extends React.Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: { sort: 'name' } },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    records: {
      type: 'okapi',
      records: 'users',
      recordsRequired: '%{resultCount}',
      perRequest: 30,
      path: 'users',
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            '(username="%{query.query}*" or personal.firstName="%{query.query}*" or personal.lastName="%{query.query}*" or personal.email="%{query.query}*" or barcode="%{query.query}*" or id="%{query.query}*" or externalSystemId="%{query.query}*")',
            {
              // the keys in this object must match those passed to
              // SearchAndSort's columnMapping prop
              'active': 'active',
              'name': 'personal.lastName personal.firstName',
              'patronGroup': 'patronGroup.group',
              'username': 'username',
              'barcode': 'barcode',
              'email': 'personal.email',
            },
            filterConfig,
            2,
          ),
        },
        staticFallback: { params: {} },
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '40',
      },
      records: 'usergroups',
    }
  });

  static propTypes = {
    idPrefix: PropTypes.string,
    onSelectRow: PropTypes.func,
    onComponentWillUnmount: PropTypes.func,
    resources: PropTypes.shape({
      patronGroups: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      })
    }).isRequired,
    mutator: PropTypes.shape({
      initializedFilterConfig: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
      records: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
      })
    }).isRequired,
    notLoadedMessage: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ]),
    stripes: PropTypes.shape({
      logger: PropTypes.object
    }).isRequired,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    idPrefix: 'uiPluginFindUsers-',
    visibleColumns: ['status', 'name', 'barcode', 'patron group', 'username', 'email']
  };

  constructor(props) {
    super(props);

    const logger = props.stripes.logger;

    this.log = logger.log.bind(logger);
    this.queryHelper = React.createRef();
    this.source = new StripesConnectedSource(this.props, logger);
  }

  componentDidUpdate() {
    const pg = (this.props.resources.patronGroups || {}).records || [];
    if (pg.length) {
      const pgFilterConfig = filterConfig.find(group => group.name === 'pg');
      const oldValuesLength = pgFilterConfig.values.length;
      pgFilterConfig.values = pg.map(rec => ({ name: rec.group, cql: rec.id }));
      if (oldValuesLength === 0) {
        this.props.mutator.initializedFilterConfig.replace(true); // triggers refresh of users
      }
    }
  }

  onNeedMore = () => {
    this.source.fetchMore(RESULT_COUNT_INCREMENT);
  };

  querySetter = ({ nsValues }) => {
    this.props.mutator.query.update(nsValues);
  }

  queryGetter = () => {
    return get(this.props.resources, 'query', {});
  }

  render() {
    const {
      onSelectRow,
      onComponentWillUnmount,
      resources,
      idPrefix,
      visibleColumns,
      notLoadedMessage
    } = this.props;

    const query = get(resources, 'query') || {};

    const sortOrder = query.sort || '';
    const patronGroups = (resources.patronGroups || {}).records || [];
    const data = get(resources, 'records.records', []);
    const message = this.source ? (
      <SearchAndSortNoResultsMessage
        source={this.source}
        searchTerm={query.query || ''}
        filterPaneIsVisible
        notLoadedMessage={notLoadedMessage}
      />) : 'no source yet';

    const resultsHeader = (
      <React.Fragment>
        <span>User Search Results</span>
        <br />
        <small>{`${data.length} results found`}</small>
      </React.Fragment>
    );
    const resultsFormatter = {
      status: user => (
        <AppIcon app="users" size="small">
          {user.active ? <FormattedMessage id="ui-users.active" /> : <FormattedMessage id="ui-users.inactive" />}
        </AppIcon>
      ),
      name: user => getFullName(user),
      barcode: user => user.barcode,
      patronGroup: (user) => {
        const pg = patronGroups.filter(g => g.id === user.patronGroup)[0];
        return pg ? pg.group : '?';
      },
      username: user => user.username,
      email: user => get(user, ['personal', 'email']),
    };

    return (
      <div data-test-find-user>
        <SearchAndSortQuery
          querySetter={this.querySetter}
          queryGetter={this.queryGetter}
          onComponentWillUnmount={onComponentWillUnmount}
          ref={this.queryHelper}
        >
          {
            ({
              searchValue,
              getSearchHandlers,
              onSubmitSearch,
              onSort,
              getFilterHandlers,
              activeFilters,
            }) => (
              <Paneset id={`${idPrefix}-paneset`}>
                <Pane defaultWidth="22%" paneTitle="User search">
                  <SearchField
                    label="user search"
                    name="query"
                    onChange={getSearchHandlers().query}
                    value={searchValue.query}
                  />
                  <Button
                    buttonStyle="primary"
                    disabled={(!searchValue.query || searchValue.query === '')}
                    onClick={onSubmitSearch}
                    fullWidth
                  >
                    Search
                  </Button>
                  <Filters
                    onChangeHandlers={getFilterHandlers()}
                    activeFilters={activeFilters}
                    config={filterConfig}
                  />
                </Pane>
                <Pane paneTitle={resultsHeader} defaultWidth="fill" padContent={false}>
                  <IntlConsumer>
                    {intl => (
                      <MultiColumnList
                        visibleColumns={visibleColumns}
                        contentData={data}
                        columnMapping={{
                          status: intl.formatMessage({ id: 'ui-users.active' }),
                          name: intl.formatMessage({ id: 'ui-users.information.name' }),
                          barcode: intl.formatMessage({ id: 'ui-users.information.barcode' }),
                          patronGroup: intl.formatMessage({ id: 'ui-users.information.patronGroup' }),
                          username: intl.formatMessage({ id: 'ui-users.information.username' }),
                          email: intl.formatMessage({ id: 'ui-users.contact.email' }),
                        }}
                        formatter={resultsFormatter}
                        onRowClick={onSelectRow}
                        onNeedMore={this.onNeedMore}
                        onHeaderClick={onSort}
                        sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
                        sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
                        isEmptyMessage={message}
                        autosize
                        virtualize
                      />
                    )}
                  </IntlConsumer>
                </Pane>
              </Paneset>
            )
          }
        </SearchAndSortQuery>
      </div>);
  }
}

export default UserSearchContainer;
