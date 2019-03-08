import React from 'react';
import PropTypes from 'prop-types';

import {
  FilterGroups,
} from '@folio/stripes/components';

export default class Filters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.object,
    onChangeHandlers: PropTypes.object.isRequired,
    config: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    activeFilters: {},
  }

  render() {
    const {
      activeFilters,
      onChangeHandlers: { checkbox, clear },
      config,
    } = this.props;

    const groupFilters = {};
    activeFilters.string.split(',').forEach(m => { groupFilters[m] = true; });

    return (
      <FilterGroups
        config={config}
        filters={groupFilters}
        onChangeFilter={checkbox}
        onClearFilter={clear}
      />
    );
  }
}
