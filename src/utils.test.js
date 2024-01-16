import { updateResourceData } from './utils';
import { UNASSIGNED_FILTER_KEY, ASSIGNED_FILTER_KEY } from './constants';

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
