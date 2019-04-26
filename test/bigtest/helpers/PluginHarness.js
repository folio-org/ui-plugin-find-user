import React from 'react';
import noop from 'lodash/noop';
import { Pluggable } from '@folio/stripes/core';

class PluginHarness extends React.Component {
  render() {
    return (
      <Pluggable
        aria-haspopup="true"
        type="find-user"
        id="clickable-find-user"
        searchLabel="Look up users"
        marginTop0
        searchButtonStyle="link"
        dataKey="patrons"
        selectUser={noop}
        visibleColumns={['status', 'name', 'patronGroup', 'username', 'barcode']}
        {...this.props}
      >
        <span data-test-no-plugin-available>No plugin available!</span>
      </Pluggable>
    );
  }
}

export default PluginHarness;
