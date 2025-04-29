// This view component contains purely presentational code, apart from UserSearchContainer that contains the data-layer access.

import { useState } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';
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
  Checkbox,
} from '@folio/stripes/components';
import {
  SearchAndSortQuery,
  SearchAndSortNoResultsMessage as NoResultsMessage,
  SearchAndSortSearchButton as FilterPaneToggle,
} from '@folio/stripes/smart-components';

import filterConfig, { filterConfigWithUserAssignedStatus } from './filterConfig';
import Filters from './Filters';

import css from './UserSearch.css';
import { getFullName, getPagingType, reduceUsersToMap } from './utils';

const UserSearchView = ({
  contentRef,
  idPrefix,
  isMultiSelect,
  onSelectRow,
  onSaveMultiple,
  onComponentWillUnmount,
  queryGetter,
  querySetter,
  initialSearch,
  source,
  data,
  onNeedMoreData,
  visibleColumns = ['name', 'active', 'barcode', 'patronGroup', 'username', 'email'],
  resultOffset,
  initialSelectedUsers,
}) => {
  const [isFilterPaneVisible, setIsFilterPaneVisible] = useState(true);
  const [checkedMap, setCheckedMap] = useState(initialSelectedUsers || {});
  const [isAllChecked, setIsAllChecked] = useState(false);

  const { patronGroups, users } = data;
  const checkedUsersLength = Object.values(checkedMap).filter(Boolean).length;
  const hasInitialSelectedUsers = initialSelectedUsers && Object.keys(initialSelectedUsers).length;
  const disabled = !hasInitialSelectedUsers && !checkedUsersLength;

  const builtVisibleColumns = isMultiSelect ? ['isChecked', ...visibleColumns] : visibleColumns;

  const query = queryGetter?.() ?? {};
  const count = users.count;
  const sortOrder = query.sort || '';
  const resultsStatusMessage = source ? (
    <div>
      <NoResultsMessage
        source={source}
        searchTerm={query.query || ''}
        filterPaneIsVisible
        toggleFilterPane={noop}
      />
    </div>) : 'no source yet';

  const resultsHeader = 'User Search Results';

  const toggleItem = user => {
    const { id } = user;
    const newUser = checkedMap[id] ? null : user;
    const newCheckedMap = {
      ...checkedMap,
      [id]: newUser,
    };

    setCheckedMap(newCheckedMap);
  };

  const resultPaneSub = count ?
    <FormattedMessage id="stripes-smart-components.searchResultsCountHeader" values={{ count }} /> :
    <FormattedMessage id="stripes-smart-components.searchCriteria" />;
  const resultsFormatter = {
    isChecked: user => (
      <Checkbox
        data-testid="row-checked"
        type="checkbox"
        checked={Boolean(checkedMap[user.id])}
        onChange={() => toggleItem(user)}
      />
    ),
    active: user => <FormattedMessage id={user.active ? 'ui-plugin-find-user.active' : 'ui-plugin-find-user.inactive'} />,
    name: (user) => (
      <>
        <AppIcon
          app="users"
          size="small"
          className={user.active ? '' : css.inactiveAppIcon}
        />
        &nbsp;
        {getFullName(user)}
      </>
    ),
    barcode: user => user.barcode,
    patronGroup: user => patronGroups.filter(g => g.id === user.patronGroup)[0]?.group ?? '?',
    username: user => user.username,
    email: user => get(user, ['personal', 'email']),
  };

  const toggleFilterPane = () => {
    setIsFilterPaneVisible(!isFilterPaneVisible);
  };

  const toggleAll = () => {
    const prevCheckedState = isAllChecked;
    setIsAllChecked(!prevCheckedState);

    const newCheckedMap = reduceUsersToMap(users.records, !prevCheckedState);
    setCheckedMap(newCheckedMap);
  };

  const isSelected = ({ item }) => Boolean(checkedMap[item.id]);

  const saveMultiple = () => {
    const usersList = Object.values(pickBy(checkedMap));

    onSaveMultiple(usersList);
  };

  const getFilterConfig = () => {
    if (initialSelectedUsers) {
      return filterConfigWithUserAssignedStatus;
    }
    return filterConfig;
  };

  const renderResultsFirstMenu = (filters) => {
    const filterCount = filters.string !== '' ? filters.string.split(',').length : 0;
    const hideOrShowMessageId = isFilterPaneVisible
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
                  data-testid="filter-pane-toggle"
                  visible={isFilterPaneVisible}
                  aria-label={`${hideOrShowMessage} \n\n${appliedFiltersMessage}`}
                  onClick={toggleFilterPane}
                  badge={!isFilterPaneVisible && filterCount ? filterCount : undefined}
                />
              )}
            </FormattedMessage>
          )}
        </FormattedMessage>
      </PaneMenu>
    );
  };

  return (
    <>
      <div
        data-testid="user-search-view"
        ref={contentRef}
        className={isMultiSelect ? css.UserSearchViewContent : ''}
      >
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
                    <Paneset
                      id={`${idPrefix}-paneset`}
                      isRoot
                    >
                      {isFilterPaneVisible &&
                        <Pane
                          data-testid="filter-pane"
                          defaultWidth="22%"
                          paneTitle="User search"
                          id="plugin-find-user-filter-pane"
                        >
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
                              />
                              <Button
                                type="submit"
                                buttonStyle="primary"
                                fullWidth
                                marginBottom0
                                disabled={(!searchValue.query || searchValue.query === '')}
                              >
                                <FormattedMessage id="ui-plugin-find-user.searchFieldLabel" />
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
                              config={getFilterConfig()}
                              resultOffset={resultOffset}
                            />
                          </form>
                        </Pane>
                      }
                      <Pane
                        firstMenu={renderResultsFirstMenu(activeFilters)}
                        paneTitle={resultsHeader}
                        paneSub={resultPaneSub}
                        defaultWidth="fill"
                        padContent={false}
                      >
                        <MultiColumnList
                          visibleColumns={builtVisibleColumns}
                          isSelected={isSelected}
                          contentData={users.records}
                          totalCount={count}
                          id="list-plugin-find-user"
                          columnMapping={{
                            isChecked: (
                              <Checkbox
                                data-testid="toggle-all-checked"
                                checked={isAllChecked}
                                onChange={toggleAll}
                                type="checkbox"
                              />
                            ),
                            active: intl.formatMessage({ id: 'ui-plugin-find-user.status' }),
                            name: intl.formatMessage({ id: 'ui-plugin-find-user.information.name' }),
                            barcode: intl.formatMessage({ id: 'ui-plugin-find-user.information.barcode' }),
                            patronGroup: intl.formatMessage({ id: 'ui-plugin-find-user.information.patronGroup' }),
                            username: intl.formatMessage({ id: 'ui-plugin-find-user.information.username' }),
                            email: intl.formatMessage({ id: 'ui-plugin-find-user.contact.email' }),
                          }}
                          formatter={resultsFormatter}
                          onRowClick={!isMultiSelect ? onSelectRow : undefined}
                          onNeedMoreData={onNeedMoreData}
                          onHeaderClick={onSort}
                          sortOrder={sortOrder.replace(/^-/, '').replace(/,.*/, '')}
                          sortDirection={sortOrder.startsWith('-') ? 'descending' : 'ascending'}
                          isEmptyMessage={resultsStatusMessage}
                          autosize
                          pageAmount={100}
                          pagingType={getPagingType(activeFilters, source, users)}
                        />

                      </Pane>

                    </Paneset>
                  )}
                </IntlConsumer>
              );
            }}
        </SearchAndSortQuery>
      </div>

      {
        isMultiSelect && (
          <div className={css.UserSearchViewFooter}>
            <>
              <div>
                <FormattedMessage
                  id="ui-plugin-find-user.modal.total"
                  values={{ count: checkedUsersLength }}
                />
              </div>
              <Button
                data-testid="save-multiple"
                marginBottom0
                onClick={saveMultiple}
                disabled={disabled}
                buttonStyle="primary"
              >
                <FormattedMessage id="ui-plugin-find-user.modal.save" />
              </Button>
            </>
          </div>
        )
      }
    </>
  );
};

UserSearchView.propTypes = {
  contentRef: PropTypes.object,
  idPrefix: PropTypes.string,
  isMultiSelect: PropTypes.bool,
  onSelectRow: PropTypes.func,
  onSaveMultiple: PropTypes.func,
  onComponentWillUnmount: PropTypes.func,
  queryGetter: PropTypes.func,
  querySetter: PropTypes.func,
  initialSearch: PropTypes.string,
  source: PropTypes.object,
  data: PropTypes.object,
  onNeedMoreData: PropTypes.func,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
  resultOffset: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }),
  initialSelectedUsers: PropTypes.shape({
    [PropTypes.string]: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string,
      active: PropTypes.bool,
      barcode: PropTypes.string,
      personal: PropTypes.shape({
        lastName: PropTypes.string,
        firstName: PropTypes.string,
        email: PropTypes.string,
      }),
      patronGroup: PropTypes.string,
    }),
  }),
};

export default UserSearchView;
