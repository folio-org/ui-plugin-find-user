import React from 'react';
import { FormattedMessage } from 'react-intl';

const filterConfig = [
  {
    label: <FormattedMessage id="ui-plugin-find-user.status" />,
    name: 'active',
    cql: 'active',
    values: [
      {
        name: 'inactive',
        cql: 'false',
        displayName: <FormattedMessage id="ui-plugin-find-user.inactive" />,
      },
      {
        name: 'active',
        cql: 'true',
        displayName: <FormattedMessage id="ui-plugin-find-user.active" />,
      },
    ],
  },
  {
    label: <FormattedMessage id="ui-plugin-find-user.information.patronGroup" />,
    name: 'pg',
    cql: 'patronGroup',
    values: [], // will be filled in by componentDidUpdate
  },
];

export const filterConfigWithUserAssignedStatus = [
  ...filterConfig,
  {
    label: <FormattedMessage id="ui-plugin-find-user.userAssignmentStatus" />,
    name: 'uas',
    cql: 'uas',
    values: [
      {
        name: 'Assigned',
        cql: 'true',
        displayName: <FormattedMessage id="ui-plugin-find-user.assigned" />,
      },
      {
        name: 'Unassigned',
        cql: 'false',
        displayName: <FormattedMessage id="ui-plugin-find-user.unassigned" />,
      },
    ],
  },
];

export default filterConfig;
