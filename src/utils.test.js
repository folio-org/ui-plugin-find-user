import { getFullName, getPagingType, reduceUsersToMap, updateResourceData } from './utils';
import { UNASSIGNED_FILTER_KEY, ASSIGNED_FILTER_KEY } from './constants';

const MCLPagingTypes = {
  PREV_NEXT: 'prevNext',
  NONE: 'none',
};

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  MCLPagingTypes,
}));

describe('updatedResourceData', () => {
  describe('when only UnAssigned filter is selected', () => {
    [UNASSIGNED_FILTER_KEY, `${ASSIGNED_FILTER_KEY},${UNASSIGNED_FILTER_KEY}`, `${UNASSIGNED_FILTER_KEY},${ASSIGNED_FILTER_KEY}`].forEach(filterStr => (
      it(`should remove ${filterStr} from filter string and add active and inactive filter strings`, () => {
        const resourceData = {
          query: {
            filters: filterStr,
          }
        };
        const expectedResourceData = {
          query: {
            ...resourceData.query,
            filters: 'active.active,active.inactive',
          },
        };
        expect(updateResourceData(resourceData)).toMatchObject(expectedResourceData);
      })
    ));
  });

  describe('when Unassigned filter is selected along with filters from other filter groups', () => {
    it('should remove Unassigned filter and return the rest', () => {
      const resourceData = {
        query: {
          filters: `${UNASSIGNED_FILTER_KEY},active.active`,
        }
      };
      const expectedResourceData = {
        query: {
          ...resourceData.query,
          filters: 'active.active',
        },
      };
      expect(updateResourceData(resourceData)).toMatchObject(expectedResourceData);
    });
  });

  describe('when Assigned filter is selected with or without combination of filters from other filter groups', () => {
    it('should remove assigned filter string', () => {
      const resourceData = {
        query: {
          filters: `${ASSIGNED_FILTER_KEY},active.active`,
        }
      };
      const expectedResourceData = {
        query: {
          ...resourceData.query,
          filters: 'active.active',
        },
      };
      expect(updateResourceData(resourceData)).toMatchObject(expectedResourceData);
    });
  });
});

describe('getFullName', () => {
  it('includes preferred first name if present', () => {
    expect(getFullName({
      personal: {
        firstName: 'mockFirstName',
        preferredFirstName: 'preferred',
      },
    })).toEqual(', preferred (mockFirstName) ');
  });

  it('falls back to empty strings', () => {
    expect(getFullName({
      personal: {},
    })).toEqual('  ');
  });
});

describe('reduceUsersToMap', () => {
  const mockUser = { id: 'mockId' };

  it('when the users are not checked', () => {
    expect(reduceUsersToMap([mockUser])).toEqual({ 'mockId': null });
  });

  it('when the users are checked', () => {
    expect(reduceUsersToMap([mockUser], true)).toEqual({ 'mockId': mockUser });
  });
});

describe('getPagingType', () => {
  it('returns PREV_NEXT paging type', () => {
    expect(getPagingType({})).toBe(MCLPagingTypes.PREV_NEXT);
  });

  it('returns NONE paging type', () => {
    expect(getPagingType({ state: { uas: ['randomValue'] } })).toBe(MCLPagingTypes.NONE);
  });
});
