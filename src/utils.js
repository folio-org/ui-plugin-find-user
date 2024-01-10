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
      usersList = assignedUsers.filter(u => filterCheck(u));
    } else {
      usersList = assignedUsers;
    }
  } else if (filterString === `${UNASSIGNED}`) {
    const assignedUserIds = Object.keys(initialSelectedUsers);
    if (filterCheck) {
      usersList = users.filter(u => !assignedUserIds.includes(u.id) && (filterCheck(u)));
    } else {
      usersList = users.filter(u => !assignedUserIds.includes(u.id));
    }
  }
  return usersList;
};

// eslint-disable-next-line consistent-return
export const getUsersBasedOnAssignmentStatus = (activeFilterState, uasFilterValue, initialSelectedUsers, users) => {
  const condForOneOfTheFilters = (u) => activeFilterState?.active?.includes(u.active ? `${ACTIVE}` : `${INACTIVE}`) || activeFilterState?.pg?.includes(u.patronGroup);
  const condForBothTheFilters = (u) => activeFilterState?.active?.includes(u.active ? `${ACTIVE}` : `${INACTIVE}`) && activeFilterState?.pg?.includes(u.patronGroup);
  // if (uasFilterValue[0] === `${ASSIGNED}`) {
  //   // when ONLY "Assigned" filter is selected
  //   const assignedUsers = Object.values(initialSelectedUsers);
  //   if (Object.keys(activeFilterState).length === 1) {
  //     return assignedUsers;
  //   }
  //   // several filters are selected
  //   // filter users based on the filter group values in place

  //   // when "Assigned" from "User Assignment Status" filter group along with some other filter in one of the other filter groups
  //   if (Object.keys(activeFilterState).length === 2) {
  //     const filteredAssignedUsers = assignedUsers.filter(u => condForOneOfTheFilters(u));
  //     return filteredAssignedUsers;
  //   }

  //   // when filters from all the filter groups are selected
  //   const filteredAssignedUsers = assignedUsers.filter(u => condForBothTheFilters(u));
  //   return filteredAssignedUsers;
  // }
  // if (uasFilterValue[0] === `${UNASSIGNED}`) {
  //   // when ONLY "Unassigned" filter is selected
  //   const assignedUserIds = Object.keys(initialSelectedUsers);
  //   if (Object.keys(activeFilterState).length === 1) {
  //     const filteredUsers = users.filter(u => !assignedUserIds.includes(u.id));
  //     return filteredUsers;
  //   }
  //   // several filters are selected
  //   // filter users based on the filter group values in place

  //   // when "UnAssigned" from "User Assignment Status" filter group along with some other filter in one of the other filter groups
  //   if (Object.keys(activeFilterState).length === 2) {
  //     const filteredAssignedUsers = users.filter(u => !assignedUserIds.includes(u.id) && (condForOneOfTheFilters(u)));
  //     return filteredAssignedUsers;
  //   }

  //   // when filters from all the filter groups are selected
  //   const filteredAssignedUsers = users.filter(u => !assignedUserIds.includes(u.id) && (condForBothTheFilters(u)));
  //   return filteredAssignedUsers;
  // }

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
