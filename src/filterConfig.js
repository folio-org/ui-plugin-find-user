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
  {
    label: <FormattedMessage id="ui-plugin-find-user.filter.userType" />,
    name: 'userType',
    cql: 'type',
    // `restrictWhenAllSelected` prevents applying cql.allRecords=1 when all filter options are selected.
    // There are more types of users then `staff`, `shadow` and `system`,
    // and we don't want to search for other types when all of them are selected.
    restrictWhenAllSelected: true,
    values: [
      {
        name: 'staff',
        cql: 'staff',
        displayName: <FormattedMessage id="ui-plugin-find-user.staff" />,
      },
      {
        name: 'shadow',
        cql: 'shadow',
        displayName: <FormattedMessage id="ui-plugin-find-user.shadow" />,
      },
      {
        name: 'system',
        cql: 'system',
        displayName: <FormattedMessage id="ui-plugin-find-user.system" />,
      },
    ],
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
