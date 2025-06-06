# Change history for ui-plugin-find-user

## In progress
* Fix the algorithm for marking all users as checked/unchecked. Refs UIPFU-115. 
* Refactor user filtering logic in UserSearchContainer. Fixes UIPFU-107.

## [8.0.0] (https://github.com/folio-org/ui-plugin-find-user/tree/v8.0.0) (2025-03-13)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v7.2.0...v8.0.0)

* React v19: refactor away from default props for functional components. Refs UIPFU-91.
* Migration of unit tests to Jest for ui-plugin-find-user/src /UserSearchView.js. Refs UIPFU-85.
* *BREAKING* Migrate stripes dependencies to their Sunflower versions. Refs UIPFU-109.
* *BREAKING* Migrate react-intl to v7. Refs UIPFU-110.

## [7.2.0] (https://github.com/folio-org/ui-plugin-find-user/tree/v7.2.0) (2024-09-05)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v7.1.2...v7.2.0)

* Create Jest test environment and setup initial mocks. Refs UIPFU-78.
* Apply Prev/Next Pagination. Refs UIPFU-49.
* Add Jest unit tests for ui-plugin-find-user/src/Filters.js. Refs UIPFU-81.
* Fix pagination issues with `Unassigned` filter. Refs UIPFU-96.
* Add Jest unit tests for ui-plugin-find-user/src/PluginFindUser.js. Refs UIPFU-82.
* Add modal title prop support. Refs UIPFU-100.

## [7.1.2](https://github.com/folio-org/ui-plugin-find-user/tree/v7.1.2) (2024-09-05)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v7.1.1...v7.1.2)

* Use keywords CQL field for keyword user search. Refs UIPFU-95.

## [7.1.1](https://github.com/folio-org/ui-plugin-find-user/tree/v7.1.1) (2024-05-03)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v7.1.0...v7.1.1)

* Fix Select User Modal with User Assignment Status Filters pagination issue. Refs UIPFU-87.
* Fix select all toggle button issue. Refs UIPFU-89.

## [7.1.0](https://github.com/folio-org/ui-plugin-find-user/tree/v7.1.0) (2024-03-20)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v7.0.0...v7.1.0)

* Add "User assignment status" filter group. Refs UIPFU-77.

## [7.0.0](https://github.com/folio-org/ui-plugin-find-user/tree/v7.0.0) (2023-10-12)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v6.3.0...v7.0.0)

* Add middle name to keyword search for Users. Refs UIPFU-58.
* Upgrade React to v18. Refs UIPFU-70.
* update NodeJS to v16 in GitHub Actions. Refs UIPFU-67.
* Add Initial Selected Users list. Refs UIPFU-71.
* Leverage `yarn.lock`. Refs UIPFU-72.
* Add PULL_REQUEST_TEMPLATE.md file to the repository. Refs UIPFU-68.
* Update Node.js to v18 in GitHub Actions. Refs. UIPFU-73.
* Fix selected users length. Refs UIPFU-75.
* Support fetch users from different tenants. Refs UIPFU-74.
* *BREAKING* bump `react-intl` to `v6.4.4`. Refs UIPFU-79.

## [6.4.0](https://github.com/folio-org/ui-plugin-find-user/tree/v6.4.0) (2023-02-20)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v6.3.0...v6.4.0)

* Bump stripes to 8.0.0 for Orchid/2023-R1. Refs UIPFU-63.

## [6.3.0](https://github.com/folio-org/ui-plugin-find-user/tree/v6.3.0) (2022-08-22)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v6.2.0...v6.3.0)

* Also query against `personal.preferredFirstName` and `customFields`. UIPFU-55.
* Use group id instead of group name when filtering. Fixes UIPFU-59.

## [6.2.0](https://github.com/folio-org/ui-plugin-find-user/tree/v6.2.0) (2022-06-28)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v6.1.0...v6.2.0)

* Replace babel-eslint with @babel/eslint-parser. UIPFU-51
* Resolve problem with focus after modal close. UIPFU-48.

## [6.1.0](https://github.com/folio-org/ui-plugin-find-user/tree/v6.1.0) (2022-03-03)

* Display preferred name in the user search modal in Checkout and Requests. UIPFU-47.

## [6.0.0](https://github.com/folio-org/ui-plugin-find-user/tree/v6.0.0) (2021-10-09)

* Update to `@folio/stripes` `v7.0.0`. UIPFU-44.

## [5.0.1](https://github.com/folio-org/ui-plugin-find-user/tree/v5.0.1) (2021-06-18)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v5.0.0...v5.0.1)

* Translations.

## [5.0.0](https://github.com/folio-org/ui-plugin-find-user/tree/v5.0.0) (2021-03-11)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v4.0.1...v5.0.0)

* Upgrade to stripes v6. Refs UIPFU-37.
* Increment `@folio/stripes-cli` to `v2`. Refs UIPFU-38.

## [4.0.1](https://github.com/folio-org/ui-plugin-find-user/tree/v4.0.1) (2020-11-03)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v4.0.0...v4.0.1)

* Retrieve up to 200 patron groups, just like ui-users. Refs UIPFU-33.
* It's election day in the USA. Vote!
* Use `offset` to request result list pages, just like in ui-users. Fixes UIPFU-35.

## [4.0.0](https://github.com/folio-org/ui-plugin-find-user/tree/v4.0.0) (2020-10-09)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v3.0.0...v4.0.0)

* Update eslint to version 6.2.1. Fixes UIPFU-24
* Modified how patron group names are displayed in filter menu. Fixes UIPFU-28
* Refactor from `bigtest/mirage` to `miragejs`
* Update to `@folio/stripes` `v5` including `react-intl` `v5.7` and `react-router` `v5.1`. Refs UIPFU-30.
* UI Glitch When Opening Proxy/Sponsor Picker. UIPFU-31.

## [3.0.0](https://github.com/folio-org/ui-plugin-find-user/tree/v3.0.0) (2020-06-09)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v2.0.1...v3.0.0)

* Update to `stripes v4.0.0`
* Update tests to accomodate `<MCL>` changes in [PR #1205](folio-org/stripes-components/pull/1205)

## [2.0.1](https://github.com/folio-org/ui-plugin-find-user/tree/v2.0.1) (2020-04-06)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v2.0.0...v2.0.1)

* Default set of visible columns uses `patronGroup` rather than `patron group`. Fixes UIPFU-22.
* Active and Inactive filters use translations from this module, not ui-users. Fixes UIPFU-26.

## [2.0.0](https://github.com/folio-org/ui-plugin-find-user/tree/v2.0.0) (2020-03-12)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.9.1...v2.0.0)

* update to `@folio/stripes` `v3.0.0`.
* Migrate from `stripes.type` to `stripes.actsAs`

## [1.9.1](https://github.com/folio-org/ui-plugin-find-user/tree/v1.9.1) (2019-12-04)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.9.0...v1.9.1)

* Correctly pass `marginBottom0` through to the `<Button>`

## [1.9.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.9.0) (2019-09-11)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.8.0...v1.9.0)

* Tokenize search terms, just like ui-users. Fixes UIPFU-17.
* Provide correct props to AppIcon. Fixes UIPFU-18.
* Label columns consistently with ui-users. Fixes UIPFU-16.
* Update handling for selection, multi-selection.

## [1.8.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.8.0) (2019-07-22)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.7.0...v1.8.0)

* Better keyboard navigation. Refs UICHKOUT-509.
* Allow selection of multiple rows. Refs UIAC-3.

## [1.7.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.7.0) (2019-05-10)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.6.0...v1.7.0)

* Complete and total routing refactor. UIU-896
* Restore the active, inactive filters a la ui-users.
* Add user status indication.

## [1.6.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.6.0) (2019-03-15)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.5.0...v1.6.0)

* Accept an `id` prop for the find user button. Refs UIU-884.
* Pass correct `packageInfo` into Users. Refs of ERM-72.

## [1.5.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.5.0) (2019-01-25)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.4.0...v1.5.0)

* Upgrade to stripes v2.0.0.

## [1.4.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.4.0) (2018-12-10)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.3.0...v1.4.0)

* Lenient prop-types for labels.

## [1.3.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.3.0) (2018-10-05)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.2.0...v1.3.0)

* Use `stripes` framework 1.0

## [1.2.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.2.0) (2018-09-04)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.1.0...v1.2.0)

* Import PropTypes from prop-types, not React. Refs STRIPES-427.
* Lint cleanup. Fixes UIPFU-3.
* Add `dataKey` to connected Users component. Fixes UIPFU-4.
* Use more-current stripes-components. Refs STRIPES-495.
* Use more-current stripes-connect. Refs STRIPES-501.
* Turn SearchAndSort's show-single-result feature off. Refs STSMACOM-52. Fixes UIREQ-60, UICHKOUT-54, UIU-373.
* Pass `browseOnly` to `<Users>` to suppress user creation and editing. Refs UIPFU-6. Available from v1.1.1.
* Set element ID on button for regression testing. UICHKOUT-414.
* Import Users without routing. Fixes UIPFU-7.
* Make styles more flexible. Fixes UIPFU-5.
* Added CSS to the modal content to fix scroll height bug. Fixes Folio-1418.

## [1.1.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.1.0) (2017-09-06)
[Full Changelog](https://github.com/folio-org/ui-plugin-find-user/compare/v1.0.0...v1.1.0)

* Update stripes-components to 1.7.0.
* Add ability to customize search button. Fixes UIPFU-2.

## [1.0.0](https://github.com/folio-org/ui-plugin-find-user/tree/v1.0.0) (2017-07-03)

* First release.
