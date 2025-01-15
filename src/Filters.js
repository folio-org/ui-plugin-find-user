import React from 'react';
import PropTypes from 'prop-types';

import {
  FilterGroups,
} from '@folio/stripes/components';

const Filters = ({
  activeFilters,
  onChangeHandlers,
  config,
  resultOffset,
}) => {
  const { clearGroup } = onChangeHandlers;

  const handleFilterChange = e => {
    if (resultOffset) {
      resultOffset.replace(0);
    }

    onChangeHandlers.checkbox(e);
  };

  const groupFilters = {};
  activeFilters.string.split(',').forEach(m => { groupFilters[m] = true; });

  return (
    <FilterGroups
      config={config}
      filters={groupFilters}
      onChangeFilter={handleFilterChange}
      onClearFilter={clearGroup}
    />
  );
};

Filters.propTypes = {
  activeFilters: PropTypes.object,
  onChangeHandlers: PropTypes.object.isRequired,
  config: PropTypes.arrayOf(PropTypes.object),
  resultOffset: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }),
};
export default Filters;
