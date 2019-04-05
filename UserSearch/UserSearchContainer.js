import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import noop from 'lodash/noop';

import { FormattedMessage } from 'react-intl';
import { IntlConsumer, AppIcon } from '@folio/stripes/core';
import {
  MultiColumnList,
  SearchField,
  Paneset,
  Pane,
  Icon,
  Button,
} from '@folio/stripes/components';

import {
  SearchAndSortQuery,
  makeQueryFunction,
  StripesConnectedSource,
  SearchAndSortNoResultsMessage as NoResultsMessage,
} from '@folio/stripes/smart-components';

import Filters from './Filters';
import filterConfig from './filterConfig';
import css from './UserSearch.css';

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
        replace: PropTypes.func.isRequired,
      })
    }).isRequired,
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

    this.logger = props.stripes.logger;
    this.log = this.logger.log.bind(this.logger);
    this.searchField = React.createRef();
  }

  componentDidMount() {
    this.source = new StripesConnectedSource(this.props, this.logger);
    this.props.mutator.query.replace('');
    if (this.searchField.current) {
      this.searchField.current.focus();
    }
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
    this.source.update(this.props);
  }

  onNeedMore = () => {
    if (this.source) {
      this.source.fetchMore(RESULT_COUNT_INCREMENT);
    }
  };

  querySetter = ({ nsValues, state }) => {
    if (/reset/.test(state.changeType)) {
      this.props.mutator.query.replace(nsValues);
    } else {
      this.props.mutator.query.update(nsValues);
    }
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
    } = this.props;

    if (this.source) {
      this.source.update(this.props);
    }
    const query = get(resources, 'query') || {};
    const count = this.source ? this.source.totalCount() : 0;
    const sortOrder = query.sort || '';
    const patronGroups = (resources.patronGroups || {}).records || [];
    const data = get(resources, 'records.records', []);
    const resultsStatusMessage = this.source ? (
      <div data-test-find-user-no-results-message>
        <NoResultsMessage
          data-test-find-user-no-results-message
          source={this.source}
          searchTerm={query.query || ''}
          filterPaneIsVisible
          toggleFilterPane={noop}
        />
      </div>) : 'no source yet';

    const resultsHeader = 'User Search Results';
    let resultPaneSub = <FormattedMessage id="stripes-smart-components.searchCriteria" />;
    if (this.source && this.source.loaded()) {
      resultPaneSub = <FormattedMessage id="stripes-smart-components.searchResultsCountHeader" values={{ count }} />;
    }

    const resultsFormatter = {
      status: user => (
        <AppIcon app="users" size="small">
          {user.active ? <FormattedMessage id="ui-plugin-find-user.active" /> : <FormattedMessage id="ui-plugin-find-user.inactive" />}
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
          initialSearch="?sort=name"
        >
          {
            ({
              searchValue,
              getSearchHandlers,
              onSubmitSearch,
              onSort,
              getFilterHandlers,
              activeFilters,
              filterChanged,
              searchChanged,
              resetAll,
            }) => {
              const disableReset = () => {
                if (filterChanged || searchChanged) {
                  return false;
                }
                return true;
              };

              return (
                <IntlConsumer>
                  {intl => (
                    <Paneset id={`${idPrefix}-paneset`}>
                      <Pane defaultWidth="22%" paneTitle="User search">
                        <form onSubmit={onSubmitSearch}>
                          <SearchField
                            aria-label="user search"
                            name="query"
                            className={css.searchField}
                            onChange={getSearchHandlers().query}
                            value={searchValue.query}
                            marginBottom0
                            autoFocus
                            inputRef={this.searchField}
                            data-test-user-search-input
                          />
                          <Button
                            type="submit"
                            buttonStyle="primary"
                            fullWidth
                            disabled={(!searchValue.query || searchValue.query === '')}
                            data-test-user-search-submit
                          >
                            Search
                          </Button>
                          <div className={css.resetButtonWrap}>
                            <Button
                              id="clickable-reset-all"
                              disabled={disableReset()}
                              fullWidth
                              onClick={resetAll}
                            >
                              <Icon icon="times-circle-solid">
                                <FormattedMessage id="stripes-smart-components.resetAll" />
                              </Icon>
                            </Button>
                          </div>
                          <Filters
                            onChangeHandlers={getFilterHandlers()}
                            activeFilters={activeFilters}
                            config={filterConfig}
                          />
                        </form>
                      </Pane>
                      <Pane paneTitle={resultsHeader} paneSub={resultPaneSub} defaultWidth="fill" padContent={false}>
                        <MultiColumnList
                          visibleColumns={visibleColumns}
                          contentData={data}
                          totalCount={count}
                          columnMapping={{
                            status: intl.formatMessage({ id: 'ui-plugin-find-user.active' }),
                            name: intl.formatMessage({ id: 'ui-plugin-find-user.information.name' }),
                            barcode: intl.formatMessage({ id: 'ui-plugin-find-user.information.barcode' }),
                            patronGroup: intl.formatMessage({ id: 'ui-plugin-find-user.information.patronGroup' }),
                            username: intl.formatMessage({ id: 'ui-plugin-find-user.information.username' }),
                            email: intl.formatMessage({ id: 'ui-plugin-find-user.contact.email' }),
                          }}
                          formatter={resultsFormatter}
                          onRowClick={onSelectRow}
                          onNeedMoreData={this.onNeedMore}
                          onHeaderClick={onSort}
                          sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
                          sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
                          isEmptyMessage={resultsStatusMessage}
                          autosize
                          virtualize
                        />

                      </Pane>

                    </Paneset>
                  )}
                </IntlConsumer>
              );
            }}
        </SearchAndSortQuery>
      </div>);
  }
}

export default UserSearchContainer;
