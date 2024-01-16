import cloneDeep from 'lodash/cloneDeep';
import {
  ASSIGNED_FILTER_KEY,
  UNASSIGNED_FILTER_KEY,
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
