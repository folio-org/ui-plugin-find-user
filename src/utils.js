import cloneDeep from 'lodash/cloneDeep';
import {
  ASSIGNED_FILTER_KEY,
  UNASSIGNED_FILTER_KEY,
  ASSIGNED,
  UNASSIGNED,
  UAS,
  ACTIVE,
  INACTIVE
} from './constants';

// eslint-disable-next-line import/prefer-default-export
export const updateResourceData = (rData) => {
  const filterString = rData?.query?.filters;
  const newRData = cloneDeep(rData);
  if (filterString === `${UNASSIGNED_FILTER_KEY}` || filterString === `${ASSIGNED_FILTER_KEY},${UNASSIGNED_FILTER_KEY}` || filterString === `${UNASSIGNED_FILTER_KEY},${ASSIGNED_FILTER_KEY}`) {
  /*
  * When Unassigned filter is selected on 'User assigbment Status' filter group, with no other filter from other groups,
  * fetch all the user records. The filter string is adjusted to include both active and inactive status filters. This will result in (cql.allRecords=1)
  *
  * The same applies when both Assigned and Unassigned are selected in any sequential order.
  */
    const alteredfilters = 'active.active,active.inactive';
    newRData.query.filters = alteredfilters;
  } else if (filterString.includes(`${UNASSIGNED_FILTER_KEY}`)) {
    /*
    * When UnAssigned filter is selected incombination with any other filters(in other filter groups),
    * filter astring for Unassigned is removed and th erest of the filter string is propagated to makeQueryFunction.
    */
    const alteredfilters = newRData.query.filters.split(',').filter(str => !str.startsWith(`${UAS}`)).join(',');
    newRData.query.filters = alteredfilters;
  } else if (filterString.includes(`${ASSIGNED_FILTER_KEY}`)) {
    /*
    * When Assigned filter is selected on 'User assigbment Status' filter group, in any combination of filters in other filter groups,
    * cql formation is not needed.
    * hence remove aus filter before propagating it further to makeQueryFunction
    */
    const alteredfilters = '';
    newRData.query.filters = alteredfilters;
  }
  return newRData;
};

const filterUsersList = (filterString, initialSelectedUsers, users, filterCheck) => {
  let usersList;
  if (filterString === `${ASSIGNED}`) {
    const assignedUsers = Object.values(initialSelectedUsers);
    if (filterCheck) {
      // "Assigned" filter along with one or more other filters from other filter groups are selected
      usersList = assignedUsers.filter(u => filterCheck(u));
    } else {
      // when ONLY "Assigned" filter is selected
      usersList = assignedUsers;
    }
  } else if (filterString === `${UNASSIGNED}`) {
    // when ONLY "Unassigned" filter is selected
    const assignedUserIds = Object.keys(initialSelectedUsers);
    if (filterCheck) {
      // "Unassigned" filter along with one or more other filters from other filter groups are selected
      usersList = users.filter(u => !assignedUserIds.includes(u.id) && (filterCheck(u)));
    } else {
      // when ONLY "Unassigned" filter is selected
      usersList = users.filter(u => !assignedUserIds.includes(u.id));
    }
  }
  return usersList;
};

// eslint-disable-next-line consistent-return
export const getUsersBasedOnAssignmentStatus = (activeFilterState, uasFilterValue, initialSelectedUsers, users) => {
  const condForOneOfTheFilters = (u) => activeFilterState?.active?.includes(u.active ? `${ACTIVE}` : `${INACTIVE}`) || activeFilterState?.pg?.includes(u.patronGroup);
  const condForBothTheFilters = (u) => activeFilterState?.active?.includes(u.active ? `${ACTIVE}` : `${INACTIVE}`) && activeFilterState?.pg?.includes(u.patronGroup);

  let usersList;
  if (Object.keys(activeFilterState).length === 1) {
    usersList = filterUsersList(uasFilterValue[0], initialSelectedUsers, users);
  } else if (Object.keys(activeFilterState).length === 2) {
    usersList = filterUsersList(uasFilterValue[0], initialSelectedUsers, users, condForOneOfTheFilters);
  } else {
    usersList = filterUsersList(uasFilterValue[0], initialSelectedUsers, users, condForBothTheFilters);
  }
  return usersList;
};
