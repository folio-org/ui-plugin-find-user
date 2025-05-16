import { render } from '@folio/jest-config-stripes/testing-library/react';

import UserSearchContainer, { buildQuery } from './UserSearchContainer';

const mockChildren = jest.fn();
const logger = { log: jest.fn() };
const queryParams = {};
const pathComponents = undefined;

const resources = {
  records: {
    records: [],
    hasLoaded: true,
  },
  patronGroups: {
    records: [],
    hasLoaded: true,
  },
};

const mutator = {
  query: {
    replace: jest.fn(),
    update: jest.fn(),
  },
  initializedFilterConfig: {
    replace: jest.fn(),
  },
  resultOffset: {
    replace: jest.fn(),
  },
  resultCount: {
    replace: jest.fn(),
  },
};

const getComponent = (props = {}) => (
  <UserSearchContainer
    resources={resources}
    mutator={mutator}
    tenantId="tenant-id"
    {...props}
  >
    {mockChildren}
  </UserSearchContainer>
);

const renderUserSearchContainer = (props = {}) => render(getComponent(props));

describe('UserSearchContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('"users" property', () => {
    describe('when the "Assigned" option of the "User Assigment Status" filter is selected and the "Unassigned" option is not selected', () => {
      const props = {
        resources: {
          query: {
            filters: 'uas.Assigned',
          },
          records: {
            hasLoaded: true,
            other: {
              totalRecords: 6,
            },
            records: [{
              id: 'id-3',
              username: 'User 3',
            }],
          },
          patronGroups: {
            records: [],
          },
        },
        initialSelectedUsers: {
          'id-1': {
            id: 'id-1',
            username: 'User 1',
          },
          'id-2': {
            id: 'id-2',
            username: 'User 2',
          },
        },
      };

      it('should return assigned users', () => {
        renderUserSearchContainer(props);

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              records: [{
                id: 'id-1',
                username: 'User 1',
              }, {
                id: 'id-2',
                username: 'User 2',
              }],
            }),
          }),
        }));
      });

      it('should return the count without taking into account the total records', () => {
        renderUserSearchContainer(props);

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              count: 2,
            }),
          }),
        }));
      });

      describe('and the "Active" option of the "Status" filter is selected and the "Inactive" option is not selected', () => {
        it('should return only active users from the assigned users', () => {
          renderUserSearchContainer({
            resources: {
              query: {
                filters: 'active.active,uas.Assigned',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [{
                  id: 'id-3',
                  username: 'User 3',
                  active: true,
                }],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': {
                id: 'id-1',
                username: 'User 1',
                active: false,
              },
              'id-2': {
                id: 'id-2',
                username: 'User 2',
                active: true,
              },
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 1,
                records: [{
                  id: 'id-2',
                  username: 'User 2',
                  active: true,
                }],
              },
            }),
          }));
        });
      });

      describe('and the "Active" option of the "Status" filter is not selected and the "Inactive" option is selected', () => {
        it('should return only inactive users from the assigned users', () => {
          renderUserSearchContainer({
            resources: {
              query: {
                filters: 'active.inactive,uas.Assigned',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [{
                  id: 'id-3',
                  username: 'User 3',
                  active: false,
                }],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': {
                id: 'id-1',
                username: 'User 1',
                active: false,
              },
              'id-2': {
                id: 'id-2',
                username: 'User 2',
                active: true,
              },
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 1,
                records: [{
                  id: 'id-1',
                  username: 'User 1',
                  active: false,
                }],
              },
            }),
          }));
        });
      });

      describe('and options of the "Patron group" filter are selected', () => {
        it('should return only users from the assigned users that belong to the selected patron groups', () => {
          renderUserSearchContainer({
            resources: {
              query: {
                filters: 'pg.patron-group-1,pg.patron-group-2,uas.Assigned',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [{
                  id: 'id-4',
                  username: 'User 4',
                  active: false,
                  patronGroup: 'patron-group-4',
                }],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': {
                id: 'id-1',
                username: 'User 1',
                active: false,
                patronGroup: 'patron-group-1',
              },
              'id-2': {
                id: 'id-2',
                username: 'User 2',
                active: true,
                patronGroup: 'patron-group-2',
              },
              'id-3': {
                id: 'id-3',
                username: 'User 3',
                active: true,
                patronGroup: 'patron-group-3',
              },
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 2,
                records: [{
                  id: 'id-1',
                  username: 'User 1',
                  active: false,
                  patronGroup: 'patron-group-1',
                }, {
                  id: 'id-2',
                  username: 'User 2',
                  active: true,
                  patronGroup: 'patron-group-2',
                }],
              },
            }),
          }));
        });
      });

      describe('and options from several filters are selected', () => {
        it('should take into account all of them', () => {
          renderUserSearchContainer({
            resources: {
              query: {
                filters: 'pg.patron-group-1,pg.patron-group-2,uas.Assigned,active.inactive',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [{
                  id: 'id-4',
                  username: 'User 4',
                  active: false,
                  patronGroup: 'patron-group-4',
                }],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': {
                id: 'id-1',
                username: 'User 1',
                active: false,
                patronGroup: 'patron-group-1',
              },
              'id-2': {
                id: 'id-2',
                username: 'User 2',
                active: true,
                patronGroup: 'patron-group-2',
              },
              'id-3': {
                id: 'id-3',
                username: 'User 3',
                active: true,
                patronGroup: 'patron-group-3',
              },
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 1,
                records: [{
                  id: 'id-1',
                  username: 'User 1',
                  active: false,
                  patronGroup: 'patron-group-1',
                }],
              },
            }),
          }));
        });
      });

      describe('when there is a query', () => {
        describe('and the `query` is a username', () => {
          it('should filter assigned users by the username', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'User1',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-3',
                    username: 'User3',
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  username: 'User1',
                },
                'id-2': {
                  id: 'id-2',
                  username: 'User12',
                },
                'id-4': {
                  id: 'id-4',
                  username: 'User4',
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 2,
                  records: [{
                    id: 'id-1',
                    username: 'User1',
                  }, {
                    id: 'id-2',
                    username: 'User12',
                  }],
                },
              }),
            }));
          });
        });

        describe('and the `query` is a firstName', () => {
          it('should filter assigned users by the username', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'John',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-3',
                    personal: {
                      firstName: 'John',
                    },
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  personal: {
                    firstName: 'foo',
                  },
                },
                'id-2': {
                  id: 'id-2',
                  personal: {
                    firstName: 'John',
                  },
                },
                'id-4': {
                  id: 'id-4',
                  personal: {
                    firstName: 'Johnny',
                  },
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 2,
                  records: [{
                    id: 'id-2',
                    personal: {
                      firstName: 'John',
                    },
                  }, {
                    id: 'id-4',
                    personal: {
                      firstName: 'Johnny',
                    },
                  }],
                },
              }),
            }));
          });

          describe('and the firstName matches the username', () => {
            it('should filter assigned users by the query', () => {
              renderUserSearchContainer({
                resources: {
                  query: {
                    query: 'Joh',
                    filters: 'uas.Assigned',
                  },
                  records: {
                    hasLoaded: true,
                    other: {
                      totalRecords: 6,
                    },
                    records: [{
                      id: 'id-3',
                      personal: {
                        firstName: 'John',
                      },
                    }],
                  },
                  patronGroups: {
                    records: [],
                  },
                },
                initialSelectedUsers: {
                  'id-1': {
                    id: 'id-1',
                    personal: {
                      firstName: 'foo',
                    },
                  },
                  'id-2': {
                    id: 'id-2',
                    personal: {
                      firstName: 'John',
                    },
                  },
                  'id-4': {
                    id: 'id-4',
                    username: 'Joh',
                  },
                },
              });

              expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                  users: {
                    count: 2,
                    records: [{
                      id: 'id-2',
                      personal: {
                        firstName: 'John',
                      },
                    }, {
                      id: 'id-4',
                      username: 'Joh',
                    }],
                  },
                }),
              }));
            });
          });
        });

        describe('and the `query` is a preferred first name', () => {
          it('should filter assigned users by the preferred first name', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'foo1',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-5',
                    personal: {
                      preferredFirstName: 'foo5',
                    },
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  personal: {
                    preferredFirstName: 'foo11',
                  },
                },
                'id-2': {
                  id: 'id-2',
                  personal: {
                    preferredFirstName: 'foo2',
                  },
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 1,
                  records: [{
                    id: 'id-1',
                    personal: {
                      preferredFirstName: 'foo11',
                    },
                  }],
                },
              }),
            }));
          });
        });

        describe('and the `query` is a preferred last name', () => {
          it('should filter assigned users by the last name', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'foo1',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-5',
                    personal: {
                      lastName: 'foo5',
                    },
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  personal: {
                    lastName: 'foo11',
                  },
                },
                'id-2': {
                  id: 'id-2',
                  personal: {
                    lastName: 'foo2',
                  },
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 1,
                  records: [{
                    id: 'id-1',
                    personal: {
                      lastName: 'foo11',
                    },
                  }],
                },
              }),
            }));
          });
        });

        describe('and the `query` is a middle name', () => {
          it('should filter assigned users by the middle name', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'foo1',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-5',
                    personal: {
                      middleName: 'foo5',
                    },
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  personal: {
                    middleName: 'foo11',
                  },
                },
                'id-2': {
                  id: 'id-2',
                  personal: {
                    middleName: 'foo2',
                  },
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 1,
                  records: [{
                    id: 'id-1',
                    personal: {
                      middleName: 'foo11',
                    },
                  }],
                },
              }),
            }));
          });
        });

        describe('and the `query` is an email', () => {
          it('should filter assigned users by the email', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'foo1',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-5',
                    personal: {
                      email: 'foo5@',
                    },
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  personal: {
                    email: 'foo11@',
                  },
                },
                'id-2': {
                  id: 'id-2',
                  personal: {
                    email: 'foo2@',
                  },
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 1,
                  records: [{
                    id: 'id-1',
                    personal: {
                      email: 'foo11@',
                    },
                  }],
                },
              }),
            }));
          });
        });

        describe('and the `query` is a barcode', () => {
          it('should filter assigned users by the barcode', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: '111',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-5',
                    barcode: '111',
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  barcode: '123',
                },
                'id-2': {
                  id: 'id-2',
                  barcode: '111',
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 1,
                  records: [{
                    id: 'id-2',
                    barcode: '111',
                  }],
                },
              }),
            }));
          });
        });

        describe('and the `query` is a user id', () => {
          it('should filter assigned users by id', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'user-id',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-5',
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'user-id-1': {
                  id: 'user-id-1',
                },
                'user-id-2': {
                  id: 'user-id-2',
                },
                'user-id-3': {
                  id: 'userId',
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 2,
                  records: [{
                    id: 'user-id-1',
                  }, {
                    id: 'user-id-2',
                  }],
                },
              }),
            }));
          });
        });

        describe('and the `query` is an external system id', () => {
          it('should filter assigned users by the external system id', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'system-id-1',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-5',
                    externalSystemId: 'system-id-5',
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  externalSystemId: 'system-id-1',
                },
                'id-2': {
                  id: 'id-2',
                  externalSystemId: 'system-id-2',
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 1,
                  records: [{
                    id: 'id-1',
                    externalSystemId: 'system-id-1',
                  }],
                },
              }),
            }));
          });
        });

        describe('and the query is custom field', () => {
          it('should filter assigned users by subfields of the custom field', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'any opt',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-6',
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  customFields: {
                    checkbox1: true,
                  },
                },
                'id-2': {
                  id: 'id-2',
                  customFields: {
                    radio1: 'opt_0',
                  },
                },
                'id-3': {
                  id: 'id-3',
                  customFields: {
                    singleSelect1: 'opt_1',
                  },
                },
                'id-4': {
                  id: 'id-4',
                  customFields: {
                    textarea1: 'opt',
                  },
                },
                'id-5': {
                  id: 'id-5',
                  customFields: {},
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 3,
                  records: [{
                    id: 'id-2',
                    customFields: {
                      radio1: 'opt_0',
                    },
                  }, {
                    id: 'id-3',
                    customFields: {
                      singleSelect1: 'opt_1',
                    },
                  }, {
                    id: 'id-4',
                    customFields: {
                      textarea1: 'opt',
                    },
                  }],
                },
              }),
            }));
          });
        });

        describe('and the query consists of multiple terms', () => {
          it('should filter assigned users by the term in a case-insensitive manner', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: '  John doe ',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-3',
                    personal: {
                      firstName: 'John',
                      lastName: 'Doe',
                    },
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  personal: {
                    firstName: 'john',
                    lastName: 'Smith',
                  },
                },
                'id-2': {
                  id: 'id-2',
                  personal: {
                    firstName: 'John',
                    lastName: 'Doe',
                  },
                },
                'id-4': {
                  id: 'id-4',
                  personal: {
                    firstName: 'Johnny',
                    lastName: 'Wilson',
                  },
                },
                'id-5': {
                  id: 'id-5',
                  personal: {
                    firstName: 'Vjohn',
                    lastName: 'Lee',
                  },
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 3,
                  records: [{
                    id: 'id-1',
                    personal: {
                      firstName: 'john',
                      lastName: 'Smith',
                    },
                  }, {
                    id: 'id-2',
                    personal: {
                      firstName: 'John',
                      lastName: 'Doe',
                    },
                  }, {
                    id: 'id-4',
                    personal: {
                      firstName: 'Johnny',
                      lastName: 'Wilson',
                    },
                  }],
                },
              }),
            }));
          });
        });

        describe('and the value of user field has multiple tokens', () => {
          it('should filter assigned users by any token', () => {
            renderUserSearchContainer({
              resources: {
                query: {
                  query: 'foo1 foo2',
                  filters: 'uas.Assigned',
                },
                records: {
                  hasLoaded: true,
                  other: {
                    totalRecords: 6,
                  },
                  records: [{
                    id: 'id-3',
                    customFields: {
                      textarea1: 'foo1 foo2',
                    },
                  }],
                },
                patronGroups: {
                  records: [],
                },
              },
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  customFields: {
                    textarea1: 'foo3 foo22 foo4',
                  },
                },
                'id-2': {
                  id: 'id-2',
                  username: 'test Foo2 ',
                },
                'id-4': {
                  id: 'id-4',
                },
              },
            });

            expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
              data: expect.objectContaining({
                users: {
                  count: 2,
                  records: [{
                    id: 'id-1',
                    customFields: {
                      textarea1: 'foo3 foo22 foo4',
                    },
                  }, {
                    id: 'id-2',
                    username: 'test Foo2 ',
                  }],
                },
              }),
            }));
          });
        });
      });

      describe('when there is sorting', () => {
        it('should sort users by name in ascending order', () => {
          const users = [
            {
              id: 'id-1',
              personal: {
                lastName: 'Doe',
                firstName: 'John',
              },
            },
            {
              id: 'id-2',
              personal: {
                lastName: 'Adams',
                firstName: 'Jane',
              },
            },
            {
              id: 'id-3',
              personal: {
                lastName: 'Doe',
                firstName: 'Alice',
              },
            },
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: 'name',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[1], // Adams, Jane
                  users[2], // Doe, Alice
                  users[0]  // Doe, John
                ],
              },
            }),
          }));
        });

        it('should sort users by name in descending order', () => {
          const users = [
            {
              id: 'id-1',
              personal: {
                lastName: 'Doe',
                firstName: 'John',
              },
            },
            {
              id: 'id-2',
              personal: {
                lastName: 'Adams',
                firstName: 'Jane',
              },
            },
            {
              id: 'id-3',
              personal: {
                lastName: 'Doe',
                firstName: 'Alice',
              },
            },
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: '-name',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[0], // Doe, John
                  users[2], // Doe, Alice
                  users[1]  // Adams, Jane
                ],
              },
            }),
          }));
        });

        it('should sort users by active status', () => {
          const users = [
            { id: 'id-1', active: false, username: 'user1' },
            { id: 'id-2', active: true, username: 'user2' },
            { id: 'id-3', active: false, username: 'user3' }
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: 'active',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[0], // false
                  users[2], // false
                  users[1]  // true
                ],
              },
            }),
          }));
        });

        it('should sort users by username', () => {
          const users = [
            { id: 'id-1', username: 'charlie' },
            { id: 'id-2', username: 'alpha' },
            { id: 'id-3', username: 'bravo' },
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: 'username',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[1], // alpha
                  users[2], // bravo
                  users[0]  // charlie
                ],
              },
            }),
          }));
        });

        it('should sort users by barcode', () => {
          const users = [
            { id: 'id-1', barcode: '3000' },
            { id: 'id-2', barcode: '1000' },
            { id: 'id-3', barcode: '2000' }
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: 'barcode',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[1], // 1000
                  users[2], // 2000
                  users[0]  // 3000
                ],
              },
            }),
          }));
        });

        it('should sort users by patronGroup', () => {
          const users = [
            { id: 'id-1', patronGroup: 'group-id-3' },
            { id: 'id-2', patronGroup: 'group-id-1' },
            { id: 'id-3', patronGroup: 'group-id-2' }
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: 'patronGroup',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                hasLoaded: true,
                records: [{
                  id: 'group-id-1',
                  group: 'staff',
                }, {
                  id: 'group-id-2',
                  group: 'graduate',
                }, {
                  id: 'group-id-3',
                  group: 'faculty',
                }],
              }
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[0], // faculty
                  users[2], // graduate
                  users[1]  // staff
                ],
              },
            }),
          }));
        });

        it('should sort users by email', () => {
          const users = [
            { id: 'id-1', personal: { email: 'john@example.com' } },
            { id: 'id-2', personal: { email: 'alice@example.com' } },
            { id: 'id-3', personal: { email: 'bob@example.com' } }
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: 'email',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[1], // alice@example.com
                  users[2], // bob@example.com
                  users[0]  // john@example.com
                ],
              },
            }),
          }));
        });

        it('should apply multiple sort parameters when first comparison is equal', () => {
          const users = [
            { id: 'id-1', active: true, username: 'charlie' },
            { id: 'id-2', active: true, username: 'alpha' },
            { id: 'id-3', active: false, username: 'bravo' }
          ];

          renderUserSearchContainer({
            resources: {
              query: {
                query: '',
                filters: 'uas.Assigned',
                sort: 'active,username',
              },
              records: {
                hasLoaded: true,
                other: {
                  totalRecords: 6,
                },
                records: [],
              },
              patronGroups: {
                records: [],
              },
            },
            initialSelectedUsers: {
              'id-1': users[0],
              'id-2': users[1],
              'id-3': users[2],
            },
          });

          expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({
              users: {
                count: 3,
                records: [
                  users[2], // bravo
                  users[1], // alpha
                  users[0]  // charlie
                ],
              },
            }),
          }));
        });
      });
    });

    describe('when the "Assigned" option of the "User Assigment Status" filter is not selected and the "Unassigned" option is selected', () => {
      const records = [
        {
          id: 'id-2',
          username: 'User 2',
        },
        {
          id: 'id-3',
          username: 'User 3',
        },
        {
          id: 'id-4',
          username: 'User 4',
        },
      ];

      const props = {
        resources: {
          query: {
            filters: 'uas.Unassigned',
          },
          records: {
            hasLoaded: true,
            other: {
              totalRecords: 12,
            },
            records,
          },
          patronGroups: {
            records: [],
          },
        },
        initialSelectedUsers: {
          'id-1': {
            id: 'id-1',
            username: 'User 1',
          },
          'id-2': {
            id: 'id-2',
            username: 'User 2',
          },
        },
      };

      it('should return fetched users without assigned ones', () => {
        const { rerender } = renderUserSearchContainer(props);

        rerender(getComponent(props));

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              records: [
                {
                  id: 'id-3',
                  username: 'User 3',
                },
                {
                  id: 'id-4',
                  username: 'User 4',
                },
              ],
            }),
          }),
        }));
      });

      it('should calculate the count by subtracting the assigned users from the total records', () => {
        const { rerender } = renderUserSearchContainer(props);

        rerender(getComponent(props));

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              count: 10,
            }),
          }),
        }));
      });
    });

    describe('when both "Assigned" and "Unassigned" options of the "User Assigment Status" filter are selected', () => {
      const records = [
        {
          id: 'id-2',
          username: 'User 2',
        },
        {
          id: 'id-3',
          username: 'User 3',
        },
        {
          id: 'id-4',
          username: 'User 4',
        },
      ];

      const props = {
        resources: {
          query: {
            filters: 'uas.Assigned,uas.Unassigned',
          },
          records: {
            hasLoaded: true,
            other: {
              totalRecords: 12,
            },
            records,
          },
          patronGroups: {
            records: [],
          },
        },
        initialSelectedUsers: {
          'id-1': {
            id: 'id-1',
            username: 'User 1',
          },
          'id-2': {
            id: 'id-2',
            username: 'User 2',
          },
        },
      };

      it('should return fetched users', () => {
        const { rerender } = renderUserSearchContainer(props);

        rerender(getComponent(props));

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              records: props.resources.records.records,
            }),
          }),
        }));
      });

      it('should return total records', () => {
        const { rerender } = renderUserSearchContainer(props);

        rerender(getComponent(props));

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              count: props.resources.records.other.totalRecords,
            }),
          }),
        }));
      });
    });

    describe('when neither "Assigned" nor "Unassigned" options of the "User Assigment Status" filter are selected', () => {
      const records = [
        {
          id: 'id-2',
          username: 'User 2',
        },
        {
          id: 'id-3',
          username: 'User 3',
        },
        {
          id: 'id-4',
          username: 'User 4',
        },
      ];

      const props = {
        resources: {
          query: {
            filters: 'active.active',
          },
          records: {
            hasLoaded: true,
            other: {
              totalRecords: 12,
            },
            records,
          },
          patronGroups: {
            records: [],
          },
        },
        initialSelectedUsers: {
          'id-1': {
            id: 'id-1',
            username: 'User 1',
          },
          'id-2': {
            id: 'id-2',
            username: 'User 2',
          },
        },
      };

      it('should return fetched users', () => {
        const { rerender } = renderUserSearchContainer(props);

        rerender(getComponent(props));

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              records: props.resources.records.records,
            }),
          }),
        }));
      });

      it('should return total records', () => {
        const { rerender } = renderUserSearchContainer(props);

        rerender(getComponent(props));

        expect(mockChildren).toHaveBeenLastCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            users: expect.objectContaining({
              count: props.resources.records.other.totalRecords,
            }),
          }),
        }));
      });
    });
  });

  describe('buildQuery', () => {
    describe('when there are assigned users (initialSelectedUsers)', () => {
      describe('when the "Assigned" option of the "User Assigment Status" filter is selected and the "Unassigned" option is not selected', () => {
        it('should return null to prevent the request', () => {
          const resourceData = {
            query: {
              filters: 'active.active,uas.Assigned',
              sort: 'name',
              query: 'Doe John',
            },
          };

          const props = {
            initialSelectedUsers: {
              'id-1': {
                id: 'id-1',
                username: 'User 1',
              },
              'id-2': {
                id: 'id-2',
                username: 'User 2',
              },
            },
            stripes: {
              hasInterface: jest.fn(() => true),
            },
          };

          const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

          expect(query).toBe(null);
        });
      });

      describe('when the "Assigned" option of the "User Assigment Status" filter is not selected and the "Unassigned" option is selected', () => {
        describe('and there is no any other filter selected and the `query` is empty', () => {
          it('should use `cql.allRecords=1` to fetch all users', () => {
            const resourceData = {
              query: {
                filters: 'uas.Unassigned',
                sort: 'name',
                query: '',
              },
            };

            const props = {
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  username: 'User 1',
                }
              },
              stripes: {
                hasInterface: jest.fn(() => true),
              },
            };

            const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

            expect(query).toBe('(cql.allRecords=1) sortby personal.lastName personal.firstName');
          });
        });

        describe('and there is at least one other filter selected', () => {
          it('should use it in the query', () => {
            const resourceData = {
              query: {
                filters: 'active.active,uas.Unassigned',
                sort: '',
                query: '',
              },
            };

            const props = {
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  active: false,
                },
              },
              stripes: {
                hasInterface: jest.fn(() => true),
              },
            };

            const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

            expect(query).toBe('active=="true"');
          });
        });

        describe('and the query is not empty', () => {
          it('should use it', () => {
            const resourceData = {
              query: {
                filters: 'uas.Unassigned',
                sort: '',
                query: 'Doe John',
              },
            };

            const props = {
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  username: 'User1',
                },
              },
              stripes: {
                hasInterface: jest.fn(() => true),
              },
            };

            const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

            expect(query).toBe('keywords="Doe*" and keywords="John*"');
          });
        });
      });

      describe('when both "Assigned" and "Unassigned" options of the "User Assigment Status" filter are selected', () => {
        describe('and there is no any other filter selected and the `query` is empty', () => {
          it('should use `cql.allRecords=1` to fetch all users', () => {
            const resourceData = {
              query: {
                filters: 'uas.Assigned,uas.Unassigned',
                sort: 'name',
                query: '',
              },
            };

            const props = {
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                  username: 'User 1',
                }
              },
              stripes: {
                hasInterface: jest.fn(() => true),
              },
            };

            const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

            expect(query).toBe('(cql.allRecords=1) sortby personal.lastName personal.firstName');
          });
        });

        describe('and there is at least one other filter selected', () => {
          it('should use it in the query', () => {
            const resourceData = {
              query: {
                filters: 'active.active,uas.Assigned,uas.Unassigned',
                sort: '',
                query: '',
              },
            };

            const props = {
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                },
              },
              stripes: {
                hasInterface: jest.fn(() => true),
              },
            };

            const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

            expect(query).toBe('active=="true"');
          });
        });

        describe('and there is a query', () => {
          it('should use it', () => {
            const resourceData = {
              query: {
                filters: 'uas.Assigned,uas.Unassigned',
                sort: '',
                query: 'Doe John',
              },
            };

            const props = {
              initialSelectedUsers: {
                'id-1': {
                  id: 'id-1',
                },
              },
              stripes: {
                hasInterface: jest.fn(() => true),
              },
            };

            const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

            expect(query).toBe('keywords="Doe*" and keywords="John*"');
          });
        });
      });
    });

    describe('when there are no assigned users (initialSelectedUsers)', () => {
      it('should generate correct query', () => {
        const resourceData = {
          query: {
            filters: 'active.active,pg.patron-group-1',
            sort: 'name',
            query: 'Doe John',
          },
        };

        const props = {
          stripes: {
            hasInterface: jest.fn(() => true),
          },
        };

        const query = buildQuery(queryParams, pathComponents, resourceData, logger, props);

        expect(query).toBe(
          '((keywords="Doe*" and keywords="John*") and active=="true" and patronGroup=="patron-group-1") ' +
          'sortby personal.lastName personal.firstName'
        );
      });
    });
  });
});
