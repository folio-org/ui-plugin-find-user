import React from 'react';
import PropTypes from 'prop-types';
import { get, template } from 'lodash';
import { stripesConnect } from '@folio/stripes/core';

import {
  makeQueryFunction,
  StripesConnectedSource,
} from '@folio/stripes/smart-components';

import filterConfig, { filterConfigWithUserAssignedStatus } from './filterConfig';
import { updateResourceData } from './utils';
import {
  filterByActiveStatus,
  filterByPatronGroup,
  filterByQuery,
  sortUsers,
} from './userUtils';
import {
  ASSIGNED_FILTER_KEY,
  UNASSIGNED_FILTER_KEY,
  UAS,
  CUSTOM_FIELDS,
  ACTIVE_FILTER_KEY,
  INACTIVE_FILTER_KEY,
} from './constants';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

// list of fields to query against
const queryFields = [
  'username',
  'personal.firstName',
  'personal.preferredFirstName',
  'personal.lastName',
  'personal.middleName',
  'personal.email',
  'barcode',
  'id',
  'externalSystemId',
  CUSTOM_FIELDS,
];

export function buildQuery(queryParams, pathComponents, resourceData, logger, props) {
  const filters = props.initialSelectedUsers ? filterConfigWithUserAssignedStatus : filterConfig;
  const updatedResourceData = props.initialSelectedUsers &&
    resourceData?.query?.filters?.includes(UAS) ? updateResourceData(resourceData) : resourceData;

  const compileQuery = props.stripes.hasInterface('users', '16.3') ?
    template('keywords="%{query}*"', { interpolate: /%{([\s\S]+?)}/g }) :
    template(
      `(${queryFields.map(f => `${f}="%{query}*"`).join(' or ')})`,
      { interpolate: /%{([\s\S]+?)}/g }
    );

  return makeQueryFunction(
    'cql.allRecords=1',
    (parsedQuery, _, localProps) => localProps.query.query.trim().split(/\s+/).map(query => compileQuery({ query })).join(' and '),
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
    filters,
    2,
  )(queryParams, pathComponents, updatedResourceData, logger, props);
}

class UserSearchContainer extends React.Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: { sort: 'name' } },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    resultOffset: { initialValue: 0 },
    records: {
      type: 'okapi',
      tenant: '!{tenantId}',
      records: 'users',
      resultOffset: '%{resultOffset}',
      resultDensity: 'sparse',
      perRequest: 100,
      path: 'users',
      GET: {
        params: { query: buildQuery },
        staticFallback: { params: {} },
      },
    },
    patronGroups: {
      type: 'okapi',
      tenant: '!{tenantId}',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '200',
      },
      records: 'usergroups',
    }
  });

  static propTypes = {
    children: PropTypes.func,
    resources: PropTypes.shape({
      query: PropTypes.shape({
        filters: PropTypes.string,
        sort: PropTypes.string,
        query: PropTypes.string,
      }).isRequired,
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
      }),
      resultCount: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }).isRequired,
      resultOffset: PropTypes.shape({
        replace: PropTypes.func.isRequired,
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      logger: PropTypes.object
    }).isRequired,
    /*
      Linter rule is disabled, because prop `tenantId` is required in manifest, and not used in component.
      As a result linter can't see prop usage and reports error
    */
    // eslint-disable-next-line react/no-unused-prop-types
    tenantId: PropTypes.string.isRequired,
    initialSelectedUsers: PropTypes.object,
  }

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
      pgFilterConfig.values = pg.map(rec => ({ name: encodeURIComponent(rec.id), displayName: rec.group, cql: rec.id }));
      if (oldValuesLength === 0) {
        this.props.mutator.initializedFilterConfig.replace(true); // triggers refresh of users
      }
    }
    this.source.update(this.props);
  }

  onNeedMoreData = (askAmount, index, firstIndex, direction) => {
    const { resultOffset } = this.props.mutator;

    const fetchedUsers = get(this.props.resources, 'records.records', []);
    const totalUserRecords = this.source.totalCount();

    if (this.source) {
      if (!direction) {
        if (fetchedUsers.length < totalUserRecords) {
          this.source.fetchOffset(fetchedUsers.length);
        }
      } else if (resultOffset && index >= 0) {
        this.source.fetchOffset(index);
      } else {
        this.source.fetchMore(RESULT_COUNT_INCREMENT);
      }
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

  getUsers = () => {
    const {
      resources,
      initialSelectedUsers,
    } = this.props;

    const {
      query,
      sort,
    } = resources.query || {};

    const users = {
      records : [],
      count: 0
    };
    const fetchedUsers = get(resources, 'records.records', []);
    const activeFilters = get(resources, 'query.filters', '');
    const assignedUsers = this.props.initialSelectedUsers ? Object.values(initialSelectedUsers) : [];
    const isAssignedOptionSelected = activeFilters.includes(ASSIGNED_FILTER_KEY);
    const isUnassignedOptionSelected = activeFilters.includes(UNASSIGNED_FILTER_KEY);
    const isActiveOptionSelected = activeFilters.includes(ACTIVE_FILTER_KEY);
    const isInactiveOptionSelected = activeFilters.includes(INACTIVE_FILTER_KEY);
    const totalRecords = this.source?.totalCount() || 0;
    const patronGroups = resources.patronGroups.records;

    // When "Assigned" option is selected and "Unassigned" option is not selected,
    // we need to filter the users on UI based on the selected filters, entered search terms, and sort them.
    if (isAssignedOptionSelected && !isUnassignedOptionSelected) {
      let filtered = filterByActiveStatus(assignedUsers, isActiveOptionSelected, isInactiveOptionSelected);
      filtered = filterByPatronGroup(filtered, activeFilters);
      filtered = filterByQuery(filtered, query, queryFields);
      filtered = sortUsers(filtered, sort, patronGroups);

      users.records = filtered;
      users.count = filtered.length;
      return users;
    }

    // When "Unassigned" option is selected and "Assigned" option is not selected,
    // we need to filter out the response from assigned users (initialSelectedUsers).
    if (!isAssignedOptionSelected && isUnassignedOptionSelected) {
      users.records = fetchedUsers.filter(user => !initialSelectedUsers[user.id]);
      users.count = totalRecords - assignedUsers.length;

      return users;
    }

    users.records = fetchedUsers;
    users.count = totalRecords;

    return users;
  }

  render() {
    const {
      resources,
      children,
      mutator: { resultOffset },
    } = this.props;

    if (this.source) {
      this.source.update(this.props);
    }

    return children({
      initialSearch: '?sort=name',
      source: this.source,
      queryGetter: this.queryGetter,
      querySetter: this.querySetter,
      onNeedMoreData: this.onNeedMoreData,
      resultOffset,
      data: {
        patronGroups: (resources.patronGroups || {}).records || [],
        users: this.getUsers(),
      },
    });
  }
}

export default stripesConnect(UserSearchContainer, { dataKey: 'find_patron' });
