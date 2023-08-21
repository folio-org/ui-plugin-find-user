import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';
import PropTypes from 'prop-types';

import { NOT_SHADOW_USER_CQL } from '../../../src/constants';
import { buildQuery } from '../../../src/UserSearchContainer';
import setupApplication, { mount } from '../helpers/helpers';
import PluginHarness from '../helpers/PluginHarness';
import FindUserInteractor from '../interactors/findUser';

let closeHandled = false;
let userChosen = false;
let selectedUsers = [];

const INITIAL_SELECTED_USERS = {
  userId1: {
    id: 'userId1',
    username: 'testuser1',
    active: false,
    barcode: '123456',
    personal: {
      firstName: 'Test',
      lastName: 'User1',
      email: 'user1@folio.org'
    },
    patronGroup: 'staff'
  },
  userId2: {
    id: 'userId2',
    username: 'testuser2',
    active: true,
    barcode: '123456',
    personal: {
      firstName: 'Test',
      lastName: 'User2',
      email: 'user2@folio.org'
    },
    patronGroup: 'staff'
  },
};

describe('UI-plugin-find-user', function () {
  const findUser = new FindUserInteractor();
  setupApplication();

  beforeEach(async function () {
    await this.server.createList('user', 40);
  });

  describe('rendering', function () {
    beforeEach(async function () {
      userChosen = false;
      closeHandled = false;
      await mount(
        <PluginHarness
          selectUser={() => { userChosen = true; }}
          afterClose={() => { closeHandled = true; }}
        />
      );
    });

    it('renders button', function () {
      expect(
        findUser.button.isPresent
      ).to.be.true;
    });

    describe('click the button', function () {
      beforeEach(async function () {
        await findUser.button.click();
        await findUser.whenModalPresent();
      });

      it('opens a modal', function () {
        expect(
          findUser.modal.isPresent
        ).to.be.true;
      });

      describe('checking show inactive filter', function () {
        beforeEach(async function () {
          await findUser.modal.clickInactiveUsersCheckbox();
          await findUser.modal.searchField.fill('t');
        });

        it('pulls a result set', function () {
          expect(findUser.modal.instances().length).to.be.greaterThan(0);
        });

        describe('resetting the filter and search', function () {
          beforeEach(async function () {
            await findUser.modal.clickInactiveUsersCheckbox();
            await findUser.modal.resetButton.click();
          });

          it('displays "No Results" message', function () {
            expect(findUser.modal.noResultsDisplayed).to.be.true;
          });

          it('unchecks the filter checkboxes', function () {
            expect(findUser.modal.filterCheckboxes().filter((cb) => cb.isChecked).length).to.equal(0);
          });

          it('clears the value in the search field', function () {
            expect(findUser.modal.searchField.value).to.equal('');
          });
        });
      });

      describe('filling in the searchField', function () {
        beforeEach(async function () {
          await findUser.modal.searchField.fill('t');
        });

        it('activates the reset button', function () {
          expect(findUser.modal.resetButton.isEnabled).to.be.true;
        });

        it('activates the search button', function () {
          expect(findUser.modal.searchButton.isEnabled).to.be.true;
        });

        describe('submitting the search', function () {
          beforeEach(async function () {
            await findUser.modal.searchButton.click();
          });

          it('returns a set of results', function () {
            expect(findUser.modal.instances().length).to.be.greaterThan(0);
          });

          describe('selecting a user', function () {
            beforeEach(async function () {
              await findUser.modal.instances(1).click();
            });

            it('hides the modal', function () {
              expect(closeHandled).to.be.true;
            });

            it('calls the selectUser callback', function () {
              expect(userChosen).to.be.true;
            });
          });
        });
      });
    });
  });

  describe('Multiselection of users', function () {
    beforeEach(async function () {
      await mount(
        <PluginHarness
          selectUsers={(users) => { selectedUsers = users; }}
        />
      );
    });

    describe('Opening the modal', function () {
      beforeEach(async function () {
        await findUser.button.click();
        await findUser.modal.clickInactiveUsersCheckbox();
        await findUser.modal.searchField.fill('t');
      });

      it('displays rows with checkboxes', () => {
        expect(findUser.modal.instances(0).hasCheckbox).to.be.true;
      });

      it('displays "save" button', () => {
        expect(findUser.modal.saveMultipleButton.isPresent).to.be.true;
      });

      describe('selecting multiple users', function () {
        beforeEach(async function () {
          selectedUsers = [];
          await findUser.modal.instances(1).check();
          await findUser.modal.instances(3).check();
          await findUser.modal.saveMultipleButton.click();
        });

        it('returns selected users', function () {
          expect(selectedUsers.length).to.equal(2);
        });
      });

      describe('unselect users', function () {
        beforeEach(async function () {
          selectedUsers = [];
          await findUser.modal.instances(1).check();
          await findUser.modal.instances(3).check();
          await findUser.modal.instances(3).check();
          await findUser.modal.saveMultipleButton.click();
        });

        it('returns selected users after unselect a user', function () {
          expect(selectedUsers.length).to.equal(1);
        });
      });
    });
  });

  describe('initialSelectedUsers', function () {
    beforeEach(async function () {
      await mount(
        <PluginHarness
          selectUsers={(users) => { selectedUsers = users; }}
          initialSelectedUsers={INITIAL_SELECTED_USERS}
        />
      );

      selectedUsers = [];
      await findUser.button.click();
      await findUser.modal.clickInactiveUsersCheckbox();
      await findUser.modal.searchField.fill('t');
      await findUser.modal.saveMultipleButton.click();
    });

    it('should return one initial selected user', function () {
      expect(selectedUsers.length).to.equal(Object.keys(INITIAL_SELECTED_USERS).length);
    });
  });
});

describe('UsersShape PropTypes', () => {
  it('should validate correctly for valid prop', () => {
    const validProps = {
      user1: {
        username: 'user1',
        id: '1',
        active: true,
        barcode: 'barcode1',
        personal: {
          lastName: 'Last',
          firstName: 'First',
          email: 'user1@example.com',
        },
        patronGroup: 'group1',
      },
    };
    const result = PropTypes.checkPropTypes(
      { users:  PropTypes.shape({
        [PropTypes.string]: PropTypes.shape({
          username: PropTypes.string,
          id: PropTypes.string,
          active: PropTypes.bool,
          barcode: PropTypes.string,
          personal: PropTypes.shape({
            lastName: PropTypes.string,
            firstName: PropTypes.string,
            email: PropTypes.string,
          }),
          patronGroup: PropTypes.string,
        }),
      }) },
      { users: validProps },
      'users',
      'TestComponent'
    );
    expect(result).to.equal(undefined);
  });

  describe('buildQuery', () => {
    const queryParams = {
      filters: 'active.active',
      query: 'Joe',
      sort: 'name',
    };
    const pathComponents = {};
    const resourceData = {
      query: queryParams,
    };
    const logger = {
      log: () => {},
    };

    it('should exclude shadow users when building CQL query', () => {
      expect(buildQuery(queryParams, pathComponents, resourceData, logger)).contain(NOT_SHADOW_USER_CQL);
    });
  });
});
