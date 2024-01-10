import { updateResourceData, getUsersBasedOnAssignmentStatus } from './utils';
import { UNASSIGNED_FILTER_KEY, ASSIGNED_FILTER_KEY } from './constants';

describe('updatedResourceData', () => {
  describe('when only UnAssigned filter is selected', () => {
    [`${UNASSIGNED_FILTER_KEY}`, `${ASSIGNED_FILTER_KEY},${UNASSIGNED_FILTER_KEY}`, `${UNASSIGNED_FILTER_KEY},${ASSIGNED_FILTER_KEY}`].forEach(filterStr => (
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

  describe('when Assigned filter is selected with or without combonation of filters from other filter groups', () => {
    it('should remove filter string', () => {
      const resourceData = {
        query: {
          filters: `${ASSIGNED_FILTER_KEY},active.active`,
        }
      };
      const expectedResourceData = {
        query: {
          ...resourceData.query,
          filters: '',
        },
      };
      expect(updateResourceData(resourceData)).toMatchObject(expectedResourceData);
    });
  });
});

describe('getUsersBasedOnAssignmentStatus', () => {
  describe('when ONLY Assigned filter is selected', () => {
    it('should return assigned users', () => {
      const activeFilterState = { uas: ['Assigned'] };
      const uasFilterValue = ['Assigned'];
      const initialSelectedUsers = {
        '7daa365a-d8c1-4e5d-90ac-ab38f8230827': {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        }
      };
      const users = [];
      expect(getUsersBasedOnAssignmentStatus(activeFilterState, uasFilterValue, initialSelectedUsers, users)).toMatchObject(Object.values(initialSelectedUsers));
    });
  });

  describe('when Assigned filter is selected along with other filters from one of the other filter groups', () => {
    it('should filter active filters from assigned users', () => {
      const activeFilterState = { uas: ['Assigned'], active: ['active'] };
      const uasFilterValue = ['Assigned'];
      const initialSelectedUsers = {
        '7daa365a-d8c1-4e5d-90ac-ab38f8230827': {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        }
      };
      const users = [];
      const expectedAssignedUsers = [initialSelectedUsers['7daa365a-d8c1-4e5d-90ac-ab38f8230827']];
      expect(getUsersBasedOnAssignmentStatus(activeFilterState, uasFilterValue, initialSelectedUsers, users)).toMatchObject(Object.values(expectedAssignedUsers));
    });
  });

  describe('when Assigned filter is selected along with filters from other filter groups', () => {
    it('should filter assigned user based on the filters from other filter groups - status and patrongroup', () => {
      const activeFilterState = { uas: ['Assigned'], active: ['active'], pg: ['3684a786-6671-4268-8ed0-9db82ebca60b'] };
      const uasFilterValue = ['Assigned'];
      const initialSelectedUsers = {
        '7daa365a-d8c1-4e5d-90ac-ab38f8230827': {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        }
      };
      const users = [];
      const expectedAssignedUsers = [initialSelectedUsers['7daa365a-d8c1-4e5d-90ac-ab38f8230827']];
      expect(getUsersBasedOnAssignmentStatus(activeFilterState, uasFilterValue, initialSelectedUsers, users)).toMatchObject(Object.values(expectedAssignedUsers));
    });
  });

  describe('when ONLY Unassigned filter is selected', () => {
    it('should filter unassigned users from the list of users and return the rest', () => {
      const activeFilterState = { uas: ['Unassigned'] };
      const uasFilterValue = ['Unassigned'];
      const initialSelectedUsers = {
        '7daa365a-d8c1-4e5d-90ac-ab38f8230827': {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        }
      };
      const users = [
        {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        },
        {
          'username': 'devonte',
          'id': 'a208cf17-a7f0-452d-ae0e-64011232c86d',
          'barcode': '745758690367580',
          'active': true,
          'type': 'patron',
          'patronGroup': 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
          'departments': [],
          'proxyFor': [],
          'personal': {
            'lastName': 'Abbott',
            'firstName': 'Candace',
            'middleName': 'Fanny',
            'email': 'guy@lemke-llc.ok.us',
            'phone': '(136)082-4680 x8231',
            'mobilePhone': '(436)763-7413',
            'dateOfBirth': '1986-06-26T00:00:00.000+00:00',
            'addresses': [
              {
                'countryId': 'US',
                'addressLine1': '43069 Lobby',
                'city': 'Seal Beach',
                'region': 'NC',
                'postalCode': '35848-5877',
                'addressTypeId': '93d3d88d-499b-45d0-9bc7-ac73c3a19880',
                'primaryAddress': true
              }
            ],
            'preferredContactTypeId': '002'
          },
          'enrollmentDate': '2015-08-28T00:00:00.000+00:00',
          'expirationDate': '2026-01-01T23:59:59.000+00:00',
          'createdDate': '2024-01-10T07:32:22.263+00:00',
          'updatedDate': '2024-01-10T07:32:22.263+00:00',
          'metadata': {
            'createdDate': '2024-01-10T01:51:44.010+00:00',
            'updatedDate': '2024-01-10T07:32:22.260+00:00',
            'updatedByUserId': '43470c3d-1823-4b99-a24f-143728fc894a'
          },
          'tags': {
            'tagList': []
          },
          'customFields': {}
        }
      ];
      const expectedUnAssignedUsers = [{
        'username': 'devonte',
        'id': 'a208cf17-a7f0-452d-ae0e-64011232c86d',
        'barcode': '745758690367580',
        'active': true,
        'type': 'patron',
        'patronGroup': 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
        'departments': [],
        'proxyFor': [],
        'personal': {
          'lastName': 'Abbott',
          'firstName': 'Candace',
          'middleName': 'Fanny',
          'email': 'guy@lemke-llc.ok.us',
          'phone': '(136)082-4680 x8231',
          'mobilePhone': '(436)763-7413',
          'dateOfBirth': '1986-06-26T00:00:00.000+00:00',
          'addresses': [
            {
              'countryId': 'US',
              'addressLine1': '43069 Lobby',
              'city': 'Seal Beach',
              'region': 'NC',
              'postalCode': '35848-5877',
              'addressTypeId': '93d3d88d-499b-45d0-9bc7-ac73c3a19880',
              'primaryAddress': true
            }
          ],
          'preferredContactTypeId': '002'
        },
        'enrollmentDate': '2015-08-28T00:00:00.000+00:00',
        'expirationDate': '2026-01-01T23:59:59.000+00:00',
        'createdDate': '2024-01-10T07:32:22.263+00:00',
        'updatedDate': '2024-01-10T07:32:22.263+00:00',
        'metadata': {
          'createdDate': '2024-01-10T01:51:44.010+00:00',
          'updatedDate': '2024-01-10T07:32:22.260+00:00',
          'updatedByUserId': '43470c3d-1823-4b99-a24f-143728fc894a'
        },
        'tags': {
          'tagList': []
        },
        'customFields': {}
      }];
      expect(getUsersBasedOnAssignmentStatus(activeFilterState, uasFilterValue, initialSelectedUsers, users)).toMatchObject(Object.values(expectedUnAssignedUsers));
    });
  });

  describe('when Unassigned filter is selected along with one of the filrers from other filter groups', () => {
    it('should filter unassigned users based on the the filter', () => {
      const activeFilterState = { uas: ['Unassigned'], active: ['active'] };
      const uasFilterValue = ['Unassigned'];
      const initialSelectedUsers = {
        '7daa365a-d8c1-4e5d-90ac-ab38f8230827': {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        }
      };
      const users = [
        {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        },
        {
          'username': 'devonte',
          'id': 'a208cf17-a7f0-452d-ae0e-64011232c86d',
          'barcode': '745758690367580',
          'active': true,
          'type': 'patron',
          'patronGroup': 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
          'departments': [],
          'proxyFor': [],
          'personal': {
            'lastName': 'Abbott',
            'firstName': 'Candace',
            'middleName': 'Fanny',
            'email': 'guy@lemke-llc.ok.us',
            'phone': '(136)082-4680 x8231',
            'mobilePhone': '(436)763-7413',
            'dateOfBirth': '1986-06-26T00:00:00.000+00:00',
            'addresses': [
              {
                'countryId': 'US',
                'addressLine1': '43069 Lobby',
                'city': 'Seal Beach',
                'region': 'NC',
                'postalCode': '35848-5877',
                'addressTypeId': '93d3d88d-499b-45d0-9bc7-ac73c3a19880',
                'primaryAddress': true
              }
            ],
            'preferredContactTypeId': '002'
          },
          'enrollmentDate': '2015-08-28T00:00:00.000+00:00',
          'expirationDate': '2026-01-01T23:59:59.000+00:00',
          'createdDate': '2024-01-10T07:32:22.263+00:00',
          'updatedDate': '2024-01-10T07:32:22.263+00:00',
          'metadata': {
            'createdDate': '2024-01-10T01:51:44.010+00:00',
            'updatedDate': '2024-01-10T07:32:22.260+00:00',
            'updatedByUserId': '43470c3d-1823-4b99-a24f-143728fc894a'
          },
          'tags': {
            'tagList': []
          },
          'customFields': {}
        }
      ];
      const expectedUnAssignedUsers = [{
        'username': 'devonte',
        'id': 'a208cf17-a7f0-452d-ae0e-64011232c86d',
        'barcode': '745758690367580',
        'active': true,
        'type': 'patron',
        'patronGroup': 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
        'departments': [],
        'proxyFor': [],
        'personal': {
          'lastName': 'Abbott',
          'firstName': 'Candace',
          'middleName': 'Fanny',
          'email': 'guy@lemke-llc.ok.us',
          'phone': '(136)082-4680 x8231',
          'mobilePhone': '(436)763-7413',
          'dateOfBirth': '1986-06-26T00:00:00.000+00:00',
          'addresses': [
            {
              'countryId': 'US',
              'addressLine1': '43069 Lobby',
              'city': 'Seal Beach',
              'region': 'NC',
              'postalCode': '35848-5877',
              'addressTypeId': '93d3d88d-499b-45d0-9bc7-ac73c3a19880',
              'primaryAddress': true
            }
          ],
          'preferredContactTypeId': '002'
        },
        'enrollmentDate': '2015-08-28T00:00:00.000+00:00',
        'expirationDate': '2026-01-01T23:59:59.000+00:00',
        'createdDate': '2024-01-10T07:32:22.263+00:00',
        'updatedDate': '2024-01-10T07:32:22.263+00:00',
        'metadata': {
          'createdDate': '2024-01-10T01:51:44.010+00:00',
          'updatedDate': '2024-01-10T07:32:22.260+00:00',
          'updatedByUserId': '43470c3d-1823-4b99-a24f-143728fc894a'
        },
        'tags': {
          'tagList': []
        },
        'customFields': {}
      }];
      expect(getUsersBasedOnAssignmentStatus(activeFilterState, uasFilterValue, initialSelectedUsers, users)).toMatchObject(Object.values(expectedUnAssignedUsers));
    });
  });

  describe('when Unassigned filter is selected along with filters from other filter groups', () => {
    it('should filter assigned user based on the filters from other filter groups - status and patrongroup', () => {
      const activeFilterState = { uas: ['Unassigned'], active: ['active'], pg: ['ad0bc554-d5bc-463c-85d1-5562127ae91b'] };
      const uasFilterValue = ['Unassigned'];
      const initialSelectedUsers = {
        '7daa365a-d8c1-4e5d-90ac-ab38f8230827': {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        }
      };
      const users = [
        {
          'username': 'acq-admin',
          'id': '7daa365a-d8c1-4e5d-90ac-ab38f8230827',
          'barcode': '1704852123910366583',
          'active': true,
          'type': 'patron',
          'departments': [],
          'proxyFor': [],
          'createdDate': '2024-01-10T02:02:03.939+00:00',
          'updatedDate': '2024-01-10T02:02:03.939+00:00',
          'metadata': {
            'createdDate': '2024-01-10T02:02:03.936+00:00',
            'createdByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b',
            'updatedDate': '2024-01-10T02:02:03.936+00:00',
            'updatedByUserId': '4074b75e-5c13-5dde-b78c-b07a420c6e3b'
          },
          'personal': {
            'lastName': 'Admin',
            'firstName': 'acq-admin',
            'addresses': []
          },
          'patronGroup': '3684a786-6671-4268-8ed0-9db82ebca60b',
          'fullName': 'Admin, acq-admin',
          'groupName': 'staff'
        },
        {
          'username': 'devonte',
          'id': 'a208cf17-a7f0-452d-ae0e-64011232c86d',
          'barcode': '745758690367580',
          'active': true,
          'type': 'patron',
          'patronGroup': 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
          'departments': [],
          'proxyFor': [],
          'personal': {
            'lastName': 'Abbott',
            'firstName': 'Candace',
            'middleName': 'Fanny',
            'email': 'guy@lemke-llc.ok.us',
            'phone': '(136)082-4680 x8231',
            'mobilePhone': '(436)763-7413',
            'dateOfBirth': '1986-06-26T00:00:00.000+00:00',
            'addresses': [
              {
                'countryId': 'US',
                'addressLine1': '43069 Lobby',
                'city': 'Seal Beach',
                'region': 'NC',
                'postalCode': '35848-5877',
                'addressTypeId': '93d3d88d-499b-45d0-9bc7-ac73c3a19880',
                'primaryAddress': true
              }
            ],
            'preferredContactTypeId': '002'
          },
          'enrollmentDate': '2015-08-28T00:00:00.000+00:00',
          'expirationDate': '2026-01-01T23:59:59.000+00:00',
          'createdDate': '2024-01-10T07:32:22.263+00:00',
          'updatedDate': '2024-01-10T07:32:22.263+00:00',
          'metadata': {
            'createdDate': '2024-01-10T01:51:44.010+00:00',
            'updatedDate': '2024-01-10T07:32:22.260+00:00',
            'updatedByUserId': '43470c3d-1823-4b99-a24f-143728fc894a'
          },
          'tags': {
            'tagList': []
          },
          'customFields': {}
        }
      ];
      const expectedUnAssignedUsers = [{
        'username': 'devonte',
        'id': 'a208cf17-a7f0-452d-ae0e-64011232c86d',
        'barcode': '745758690367580',
        'active': true,
        'type': 'patron',
        'patronGroup': 'ad0bc554-d5bc-463c-85d1-5562127ae91b',
        'departments': [],
        'proxyFor': [],
        'personal': {
          'lastName': 'Abbott',
          'firstName': 'Candace',
          'middleName': 'Fanny',
          'email': 'guy@lemke-llc.ok.us',
          'phone': '(136)082-4680 x8231',
          'mobilePhone': '(436)763-7413',
          'dateOfBirth': '1986-06-26T00:00:00.000+00:00',
          'addresses': [
            {
              'countryId': 'US',
              'addressLine1': '43069 Lobby',
              'city': 'Seal Beach',
              'region': 'NC',
              'postalCode': '35848-5877',
              'addressTypeId': '93d3d88d-499b-45d0-9bc7-ac73c3a19880',
              'primaryAddress': true
            }
          ],
          'preferredContactTypeId': '002'
        },
        'enrollmentDate': '2015-08-28T00:00:00.000+00:00',
        'expirationDate': '2026-01-01T23:59:59.000+00:00',
        'createdDate': '2024-01-10T07:32:22.263+00:00',
        'updatedDate': '2024-01-10T07:32:22.263+00:00',
        'metadata': {
          'createdDate': '2024-01-10T01:51:44.010+00:00',
          'updatedDate': '2024-01-10T07:32:22.260+00:00',
          'updatedByUserId': '43470c3d-1823-4b99-a24f-143728fc894a'
        },
        'tags': {
          'tagList': []
        },
        'customFields': {}
      }];
      expect(getUsersBasedOnAssignmentStatus(activeFilterState, uasFilterValue, initialSelectedUsers, users)).toMatchObject(Object.values(expectedUnAssignedUsers));
    });
  });
});
