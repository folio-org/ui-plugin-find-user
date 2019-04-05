import { interactor, isPresent } from '@bigtest/interactor';

// https://bigtestjs.io/guides/interactors/introduction/
@interactor class ApplicationInteractor {
  static defaultScope = '#ModuleContainer';
  pluginNotFound = isPresent('[data-test-no-plugin-available]');
}

export default ApplicationInteractor;
