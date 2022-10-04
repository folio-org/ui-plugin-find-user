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
    resultOffset: PropTypes.shape({
      replace: PropTypes.func.isRequired,
    }),
  };

  static defaultProps = {
    activeFilters: {},
  }

  handleFilterChange = e => {
    const {
      resultOffset,
      onChangeHandlers,
    } = this.props;

    if (resultOffset) {
      resultOffset.replace(0);
    }

    onChangeHandlers.checkbox(e);
  }

  render() {
    const {
      activeFilters,
      onChangeHandlers: { clearGroup },
      config,
    } = this.props;

    const groupFilters = {};
    activeFilters.string.split(',').forEach(m => { groupFilters[m] = true; });

    console.log(config, groupFilters);

    return (
      <FilterGroups
        config={config}
        filters={groupFilters}
        onChangeFilter={this.handleFilterChange}
        onClearFilter={clearGroup}
      />
    );
  }
}
