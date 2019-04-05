import {
  interactor,
  scoped,
  collection,
  clickable,
  focusable,
  fillable,
  blurrable,
  is,
  isPresent,
  text,
} from '@bigtest/interactor';

import css from '../../../UserSearch/UserSearch.css';

@interactor class SearchField {
  static defaultScope = '[data-test-user-search-input]';
  isFocused = is(':focus');
  focus = focusable();
  fill = fillable();
  blur = blurrable();
  value = text();
}

@interactor class PluginModalInteractor {
  clickInactiveUsersCheckbox = clickable('#clickable-filter-active-include-inactive-users');
  clickFacultyCheckbox = clickable('#clickable-filter-pg-faculty');
  clickGraduateCheckbox = clickable('#clickable-filter-pg-graduate');
  clickStaffCheckbox = clickable('#clickable-filter-pg-staff');
  clickUndergradCheckbox = clickable('#clickable-filter-pg-undergrad');

  instances = collection('[role="row"]', {
    click: clickable()
  });

  resetButton = scoped('#clickable-reset-all', {
    isEnabled: is(':not([disabled])'),
    click: clickable()
  });

  filterCheckboxes = collection('input [type="checkbox"]', {
    isChecked: is(':checked'),
  });

  searchField = scoped('[data-test-user-search-input]', SearchField);
  searchFocused = is('[data-test-user-search-input]', ':focus');
  searchButton = scoped('[data-test-user-search-submit]', {
    click: clickable(),
    isEnabled: is(':not([disabled])'),
  });

  noResultsDisplayed = isPresent('[data-test-find-user-no-results-message]');
}

@interactor class FindUserInteractor {
  button = scoped('[data-test-plugin-find-user-button]');
  modal = new PluginModalInteractor(`.${css.modalContent}`);
}

export default FindUserInteractor;
