import get from 'lodash/get';
import {
  CUSTOM_FIELDS,
  SORTABLE_FIELD,
  PG,
} from './constants';

const filterByActiveStatus = (users, isActiveOptionSelected, isInactiveOptionSelected) => {
  if (isActiveOptionSelected && !isInactiveOptionSelected) {
    return users.filter(user => user.active);
  }

  if (!isActiveOptionSelected && isInactiveOptionSelected) {
    return users.filter(user => !user.active);
  }

  return users;
};

const filterByPatronGroup = (users, activeFilters) => {
  const isPatronGroupOptionSelected = activeFilters.includes(`${PG}.`);

  if (!isPatronGroupOptionSelected) return users;

  const patronGroupSelectedOptions = activeFilters.split(',').filter(option => option.startsWith(`${PG}.`));
  const patronGroupIds = patronGroupSelectedOptions.map(option => option.split('.')[1]);

  return users.filter(user => patronGroupIds.includes(user.patronGroup));
};

// Split the search query into tokens, then check if any of the tokens
// matches the value of any field of the user object (the value is also tokenized).
// Filter out users who don't have any tokens from the entered search query.
// e.g. if the search query is "John Doe", the user object has a field `username` with value "John Smith",
// the user will be included in the result set, because "John" is a token from the search query and
// "John" is also a token from the user object field value.
const filterByQuery = (users, query, queryFields) => {
  if (!query) return users;

  const getTokens = (value) => value.trim().split(/\s+/);

  const getIsMatch = (value) => {
    if (typeof value !== 'string') return false;

    const searchTokens = getTokens(query);
    const valueTokens = getTokens(value);

    return searchTokens.some(searchToken => {
      return valueTokens.some(valueToken => {
        return valueToken.toLowerCase().startsWith(searchToken.toLowerCase());
      });
    });
  };

  return users.filter(user => {
    const hasMatch = queryFields.some(field => {
      const customFields = user[CUSTOM_FIELDS];

      if (field === CUSTOM_FIELDS && customFields) {
        return Object.values(customFields).some(getIsMatch);
      }

      const value = get(user, field, '');

      return getIsMatch(value);
    });

    return hasMatch;
  });
};

const compareByName = (a, b) => {
  const lastNameA = get(a, 'personal.lastName', '').toLowerCase();
  const lastNameB = get(b, 'personal.lastName', '').toLowerCase();

  let compareResult = lastNameA.localeCompare(lastNameB);

  if (compareResult === 0) {
    const firstNameA = get(a, 'personal.firstName', '').toLowerCase();
    const firstNameB = get(b, 'personal.firstName', '').toLowerCase();

    compareResult = firstNameA.localeCompare(firstNameB);
  }

  return compareResult;
};

const compareByActiveStatus = (a, b) => {
  const activeA = a.active;
  const activeB = b.active;
  const isActiveA = activeA ? 1 : 0;
  const isActiveB = activeB ? 1 : 0;

  return isActiveA - isActiveB;
};

const compareByBarcode = (a, b) => {
  const barcodeA = (a.barcode || '').toLowerCase();
  const barcodeB = (b.barcode || '').toLowerCase();

  return barcodeA.localeCompare(barcodeB);
};

const compareByPatronGroup = (a, b, patronGroups) => {
  const patronGroupMap = patronGroups.reduce((acc, patronGroup) => {
    acc[patronGroup.id] = patronGroup.group;
    return acc;
  }, {});

  const patronGroupA = (patronGroupMap[a.patronGroup] || '').toLowerCase();
  const patronGroupB = (patronGroupMap[b.patronGroup] || '').toLowerCase();

  return patronGroupA.localeCompare(patronGroupB);
};

const compareByUsername = (a, b) => {
  const usernameA = (a.username || '').toLowerCase();
  const usernameB = (b.username || '').toLowerCase();

  return usernameA.localeCompare(usernameB);
};

const compareByEmail = (a, b) => {
  const emailA = get(a, 'personal.email', '').toLowerCase();
  const emailB = get(b, 'personal.email', '').toLowerCase();

  return emailA.localeCompare(emailB);
};

const sortUsers = (users, sort, patronGroups) => {
  if (!sort) return users;

  const sortParams = sort.split(',');

  return users.toSorted((a, b) => {
    for (const param of sortParams) {
      const isDescending = param.startsWith('-');
      const fieldName = isDescending ? param.substring(1) : param;
      let compareResult = 0;

      switch (fieldName) {
        case SORTABLE_FIELD.NAME: {
          compareResult = compareByName(a, b);
          break;
        }
        case SORTABLE_FIELD.ACTIVE: {
          compareResult = compareByActiveStatus(a, b);
          break;
        }
        case SORTABLE_FIELD.BARCODE: {
          compareResult = compareByBarcode(a, b);
          break;
        }
        case SORTABLE_FIELD.PATRON_GROUP: {
          compareResult = compareByPatronGroup(a, b, patronGroups);
          break;
        }
        case SORTABLE_FIELD.USERNAME: {
          compareResult = compareByUsername(a, b);
          break;
        }
        case SORTABLE_FIELD.EMAIL: {
          compareResult = compareByEmail(a, b);
          break;
        }
        default:
          break;
      }

      if (compareResult !== 0) {
        return isDescending ? -compareResult : compareResult;
      }
    }

    return 0;
  });
};

export {
  filterByActiveStatus,
  filterByPatronGroup,
  filterByQuery,
  sortUsers,
};
