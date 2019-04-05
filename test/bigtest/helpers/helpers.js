import setupStripesCore from '@folio/stripes-core/test/bigtest/helpers/setup-application';
import {
  withModules,
  clearModules,
} from '@folio/stripes-core/test/bigtest/helpers/stripes-config';
import mirageOptions from '../network';

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
      module: null
    }],

    translations: {
      'dummy.title': 'Dummy'
    },
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
