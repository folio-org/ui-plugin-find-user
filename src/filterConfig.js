import React from 'react';
import { FormattedMessage } from 'react-intl';

const filterConfig = [
  {
    label: <FormattedMessage id="ui-plugin-find-user.status" />,
    name: 'active',
    cql: 'active',
    values: [
      { name: 'inactive', cql: 'false' },
      { name: 'active', cql: 'true' },
    ],
  },
  {
    label: <FormattedMessage id="ui-plugin-find-user.information.patronGroup" />,
    name: 'pg',
    cql: 'patronGroup',
    values: [], // will be filled in by componentWillUpdate
  },
];

export default filterConfig;
