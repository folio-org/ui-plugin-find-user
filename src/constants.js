export const USER_TYPES = {
  PATRON: 'patron',
  SHADOW: 'shadow',
  STAFF: 'staff',
};

export const NOT_SHADOW_USER_CQL = `((cql.allRecords=1 NOT type ="") or type<>"${USER_TYPES.SHADOW}")`;
