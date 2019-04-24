import setupStripesCore from '@folio/stripes-core/test/bigtest/helpers/setup-application';
import {
  withModules,
  clearModules,
} from '@folio/stripes-core/test/bigtest/helpers/stripes-config';
import { beforeEach } from '@bigtest/mocha';
import mirageOptions from '../network';
import DefaultApp from './DummyComponent';

export default function setupApplication({
  scenarios,
  hasAllPerms = true,
} = {}) {
  setupStripesCore({
    mirageOptions,
    scenarios,
    stripesConfig: { hasAllPerms },

    // setup a dummy app for smart components
    modules: [{
      type: 'app',
      name: '@folio/ui-dummy',
      displayName: 'dummy.title',
      route: '/dummy',
      module: DefaultApp,
    }],

    translations: {
      'dummy.title': 'Dummy'
    },
  });

  beforeEach(function () {
    this.visit('/dummy');
  });
}

// replace the dummy app to mount the component
export function mount(component) {
  clearModules();

  withModules([{
    type: 'app',
    name: '@folio/ui-dummy',
    displayName: 'dummy.title',
    route: '/dummy',
    module: () => component
  }]);
}
