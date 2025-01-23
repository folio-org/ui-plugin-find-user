import cloneDeep from 'lodash/cloneDeep';
import { MCLPagingTypes } from '@folio/stripes/components';
import {
  ASSIGNED_FILTER_KEY,
  UNASSIGNED_FILTER_KEY,
  UNASSIGNED,
  UAS,
} from './constants';

// eslint-disable-next-line import/prefer-default-export
export const updateResourceData = (rData) => {
  const filterString = rData?.query?.filters;
  const newRData = cloneDeep(rData);

  if (filterString === UNASSIGNED_FILTER_KEY || filterString === `${ASSIGNED_FILTER_KEY},${UNASSIGNED_FILTER_KEY}` || filterString === `${UNASSIGNED_FILTER_KEY},${ASSIGNED_FILTER_KEY}`) {
  /*
  * When Unassigned filter is selected on 'User assignment Status' filter group, with no other filter from other groups,
  * fetch all the user records. The filter string is adjusted to include both active and inactive status filters. This will result in (cql.allRecords=1)
  *
  * The same applies when both Assigned and Unassigned are selected in any sequential order.
  */
    const alteredfilters = 'active.active,active.inactive';
    newRData.query.filters = alteredfilters;
  } else {
    const alteredfilters = newRData.query.filters.split(',').filter(str => !str.startsWith(UAS)).join(',');
    newRData.query.filters = alteredfilters;
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
