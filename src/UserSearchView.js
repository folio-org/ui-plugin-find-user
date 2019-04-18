// This view component contains purely presentational code, apart from UserSearchContainer that contains the data-layer access.

import React from 'react';
import PropTypes from 'prop-types';

import noop from 'lodash/noop';
import get from 'lodash/get';

import { FormattedMessage } from 'react-intl';
import { IntlConsumer, AppIcon } from '@folio/stripes/core';
import {
  MultiColumnList,
  SearchField,
  Paneset,
  Pane,
  Icon,
  Button,
  PaneMenu,
} from '@folio/stripes/components';

import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  SearchAndSortSearchButton as FilterPaneToggle,
} from '@folio/stripes/smart-components';

import filterConfig from './filterConfig';

import Filters from './Filters';
import css from './UserSearch.css';

function getFullName(user) {
  const lastName = get(user, ['personal', 'lastName'], '');
  const firstName = get(user, ['personal', 'firstName'], '');
  const middleName = get(user, ['personal', 'middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

class UserSearchView extends React.Component {
  static propTypes = {
    contentRef: PropTypes.object,
    idPrefix: PropTypes.string,
    onSelectRow: PropTypes.func,
    onComponentWillUnmount: PropTypes.func,
    queryGetter: PropTypes.func,
    querySetter: PropTypes.func,
    initialSearch: PropTypes.string,
    source: PropTypes.object,
    data: PropTypes.object,
    visibleColumns: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    idPrefix: 'uiPluginFindUsers-',
    visibleColumns: ['status', 'name', 'barcode', 'patron group', 'username', 'email'],
    data: {},
  };

  state = {
    filterPaneIsVisible: true,
  }

  toggleFilterPane = () => {
    this.setState(curState => ({
      filterPaneIsVisible: !curState.filterPaneIsVisible,
    }));
  }

  renderResultsFirstMenu(filters) {
    const { filterPaneIsVisible } = this.state;

    const filterCount = filters.string !== '' ? filters.string.split(',').length : 0;
    const hideOrShowMessageId = filterPaneIsVisible
      ? 'stripes-smart-components.hideSearchPane'
      : 'stripes-smart-components.showSearchPane';

    return (
      <PaneMenu>
        <FormattedMessage
          id="stripes-smart-components.numberOfFilters"
          values={{ count: filterCount }}
        >
          {appliedFiltersMessage => (
            <FormattedMessage id={hideOrShowMessageId}>
              {hideOrShowMessage => (
                <FilterPaneToggle
                  visible={filterPaneIsVisible}
                  aria-label={`${hideOrShowMessage} \n\n${appliedFiltersMessage}`}
                  onClick={this.toggleFilterPane}
                  badge={!filterPaneIsVisible && filterCount ? filterCount : undefined}
                />
              )}
            </FormattedMessage>
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  }

  render() {
    const {
      onSelectRow,
      onComponentWillUnmount,
      idPrefix,
      visibleColumns,
      queryGetter,
      querySetter,
      initialSearch,
      source,
      data,
      contentRef,
    } = this.props;

    const { patronGroups, users } = data;

    const query = queryGetter ? queryGetter() || {} : {};
    const count = source ? source.totalCount() : 0;
    const sortOrder = query.sort || '';
    const resultsStatusMessage = source ? (
      <div data-test-find-user-no-results-message>
        <NoResultsMessage
          data-test-find-user-no-results-message
          source={source}
          searchTerm={query.query || ''}
          filterPaneIsVisible
          toggleFilterPane={noop}
        />
      </div>) : 'no source yet';

    const resultsHeader = 'User Search Results';
    let resultPaneSub = <FormattedMessage id="stripes-smart-components.searchCriteria" />;
    if (source && source.loaded()) {
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
      <div data-test-find-user ref={contentRef}>
        <SearchAndSortQuery
          querySetter={querySetter}
          queryGetter={queryGetter}
          onComponentWillUnmount={onComponentWillUnmount}
          initialSearch={initialSearch}
          initialSearchState={{ qindex: '', query: '' }}
          syncToLocationSearch={false}
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
                      {this.state.filterPaneIsVisible &&
                        <Pane defaultWidth="22%" paneTitle="User search">
                          <form onSubmit={onSubmitSearch}>
                            <div className={css.searchGroupWrap}>
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
                                marginBottom0
                                disabled={(!searchValue.query || searchValue.query === '')}
                                data-test-user-search-submit
                              >
                                Search
                              </Button>
                            </div>
                            <div className={css.resetButtonWrap}>
                              <Button
                                buttonStyle="none"
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
                      }
                      <Pane
                        firstMenu={this.renderResultsFirstMenu(activeFilters)}
                        paneTitle={resultsHeader}
                        paneSub={resultPaneSub}
                        defaultWidth="fill"
                        padContent={false}
                      >
                        <MultiColumnList
                          visibleColumns={visibleColumns}
                          contentData={users}
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

export default UserSearchView;
