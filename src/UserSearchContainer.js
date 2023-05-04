import React from 'react';
import PropTypes from 'prop-types';
import { get, template } from 'lodash';
import { stripesConnect } from '@folio/stripes/core';

import {
  makeQueryFunction,
  StripesConnectedSource,
} from '@folio/stripes/smart-components';

import filterConfig from './filterConfig';

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

const compileQuery = template(
  `(${queryFields.map(f => `${f}="%{query}*"`).join(' or ')})`,
  { interpolate: /%{([\s\S]+?)}/g }
);

class UserSearchContainer extends React.Component {
  static manifest = Object.freeze({
    initializedFilterConfig: { initialValue: false },
    query: { initialValue: { sort: 'name' } },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    resultOffset: { initialValue: 0 },
    records: {
      type: 'okapi',
      records: 'users',
      resultOffset: '%{resultOffset}',
      perRequest: 100,
      path: 'users',
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            (parsedQuery, props, localProps) => localProps.query.query.trim().split(/\s+/).map(query => compileQuery({ query })).join(' and '),
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
        users: get(resources, 'records.records', []),
      },
    });
  }
}

export default stripesConnect(UserSearchContainer, { dataKey: 'find_patron' });
