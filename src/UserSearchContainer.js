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
  ASSIGNED_FILTER_KEY,
  UNASSIGNED_FILTER_KEY,
  UAS,
  ASSIGNED,
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
  'customFields'
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

  onNeedMoreData = (askAmount, index) => {
    const { resultOffset } = this.props.mutator;
    // let offset = index;
    // if (offset < askAmount) {
    //   /*
    //     This condition sets offset to 100 when there are less than 100 records in the current
    //     paginated result in order to skip the first 100 records and make an API call to fetch next 100.
    //   */
    //   offset = 100;
    // }
    if (this.source) {
      if (resultOffset && index >= 0) {
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

    const users = {
      records : [],
      count: 0
    };
    const fetchedUsers = get(resources, 'records.records', []);
    const activeFilters = get(resources, 'query.filters', '');
    const assignedUsers = this.props.initialSelectedUsers ? Object.values(initialSelectedUsers) : [];

    if (activeFilters === ASSIGNED_FILTER_KEY) {
      users.records = assignedUsers;
      users.count = assignedUsers.length;
      return users;
    }

    if (activeFilters.includes(UAS) && this.source && this.source.loaded()) {
      const assignedUserIds = Object.keys(initialSelectedUsers);
      const hasBothUASFilters = activeFilters.includes(ASSIGNED_FILTER_KEY) && activeFilters.includes(UNASSIGNED_FILTER_KEY);
      const uasFilterValue = activeFilters.split(',').filter(f => f.includes(UAS))[0].split('.')[1];

      if (hasBothUASFilters) {
        users.records = fetchedUsers;
        users.count = this.source.totalCount();
        return users;
      }

      if (uasFilterValue === ASSIGNED) {
        const filteredAssignedUsers = fetchedUsers.filter(u => assignedUserIds.includes(u.id));
        users.records = filteredAssignedUsers;
        users.count = filteredAssignedUsers.length;
        return users;
      }

      const filteredUnassignedUsers = fetchedUsers.filter(u => !assignedUserIds.includes(u.id));
      users.records = filteredUnassignedUsers;
      users.count = this.source.totalCount() - assignedUsers.length;
      return users;
    }

    users.records = fetchedUsers;
    users.count = this.source?.totalCount() || 0;
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
