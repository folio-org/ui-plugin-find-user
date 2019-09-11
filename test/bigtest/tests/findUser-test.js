import React from 'react';
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication, { mount } from '../helpers/helpers';
import PluginHarness from '../helpers/PluginHarness';
import FindUserInteractor from '../interactors/findUser';

let closeHandled = false;
let userChosen = false;
let selectedUsers = [];

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
      });

      it('opens a modal', function () {
        expect(
          findUser.modal.isPresent
        ).to.be.true;
      });

      it('focuses the search field', function () {
        expect(
          findUser.modal.searchField.isFocused
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

            it('focuses the modal trigger button', function () {
              expect(findUser.button.isFocused).to.be.true;
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
    });
  });
});
