import cloneDeep from 'lodash/cloneDeep';
import { MCLPagingTypes } from '@folio/stripes/components';
import {
  ASSIGNED_FILTER_KEY,
  UNASSIGNED_FILTER_KEY,
  UNASSIGNED,
  ACTIVE_FILTER_KEY,
  INACTIVE_FILTER_KEY,
} from './constants';

// eslint-disable-next-line import/prefer-default-export
export const updateResourceData = (rData) => {
  const filterString = rData?.query?.filters;
  const newRData = cloneDeep(rData);

  const isAssignedOptionSelected = filterString.includes(ASSIGNED_FILTER_KEY);
  const isUnassignedOptionSelected = filterString.includes(UNASSIGNED_FILTER_KEY);

  if (isAssignedOptionSelected && !isUnassignedOptionSelected) {
    // prevent fetching records when only "Assigned" filter is used. Filtering and sorting are handled on UI
    newRData.query.query = '';
    newRData.query.filters = '';
  } else if ((isAssignedOptionSelected && isUnassignedOptionSelected)
    || (!isAssignedOptionSelected && isUnassignedOptionSelected)) {
    const existingFilters = newRData.query.filters
      .split(',')
      // remove "User assignment status" filter options from the `query.filters`
      // as they are not in the API, they are just flags for the UI
      .filter(option => ![ASSIGNED_FILTER_KEY, UNASSIGNED_FILTER_KEY].includes(option))
      .join(',');

    // When Unassigned filter is selected, or both options of "User assignment status" filter are selected and
    // no other options from other filters are selected, and there is no search query, we need to fetch all the users,
    // but because we remove the "User assignment status" filter from the `query.filters` (BE doesn't support it),
    // we need to add the "Status" filter options (active.active,active.inactive) to trigger the search, they will be
    // converted to `cql.allRecords=1` in the `makeQueryFunction` function.
    const findAllQuery = `${ACTIVE_FILTER_KEY},${INACTIVE_FILTER_KEY}`;

    newRData.query.filters = existingFilters || findAllQuery;
  }
  return newRData;
};

export const getFullName = (user) => {
  let firstName = user?.personal?.firstName ?? '';
  const lastName = user?.personal?.lastName ?? '';
  const middleName = user?.personal?.middleName ?? '';
  const preferredFirstName = user?.personal?.preferredFirstName ?? '';

  if (preferredFirstName && firstName) {
    firstName = `${preferredFirstName} (${firstName})`;
  }

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
};

export const reduceUsersToMap = (users, isChecked = false) => {
  const usersReducer = (accumulator, user) => {
    accumulator[user.id] = isChecked ? user : null;

    return accumulator;
  };

  return users.reduce(usersReducer, {});
};

export const getPagingType = (activeFilters, source, users) => {
  const { state } = activeFilters;
  const { uas } = state || {};

  /**
   * if active filter contain "Unassigned", switch to "LOAD_MORE" paging type.
   * at the end of last page, mark the pagination as "NONE" - as, in this case
   * the end of pagination cannot be accurately handled by MCL
   */
  if (!uas || uas.length !== 1) {
    return MCLPagingTypes.PREV_NEXT;
  }

  if (uas[0] !== UNASSIGNED) {
    return MCLPagingTypes.NONE;
  }

  const recordsCount = source?.resources?.records?.records.length || 0;
  return recordsCount >= users.count ? MCLPagingTypes.NONE : MCLPagingTypes.LOAD_MORE;
};
