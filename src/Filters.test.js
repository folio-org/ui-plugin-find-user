import { FormattedMessage } from 'react-intl';

import { screen } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';
import Filters from './Filters';

jest.unmock('@folio/stripes/components');

const renderFilters = (props) => renderWithRouter(
  <Filters {...props} />
);

const props = {
  onChangeHandlers : {
    checkbox: jest.fn(),
  },
  activeFilters: {
    state: {},
    string: '',
  },
  resultOffset: {
    replace: jest.fn(),
    update: jest.fn(),
  },
  config:[
    {
      label: <FormattedMessage id="ui-plugin-find-user.status" />,
      name: 'active',
      cql: 'active',
      values: [
        {
          name: 'inactive',
          cql: 'false',
          displayName: <FormattedMessage id="ui-plugin-find-user.inactive" />,
        },
        {
          name: 'active',
          cql: 'true',
          displayName: <FormattedMessage id="ui-plugin-find-user.active" />,
        },
      ],
    },
    {
      label: <FormattedMessage id="ui-plugin-find-user.information.patronGroup" />,
      name: 'pg',
      cql: 'patronGroup',
      values: [],
    },
  ],
};

describe('Filters', () => {
  beforeEach(() => {
    renderFilters(props);
  });

  it('should render status filter groups', () => {
    expect(screen.queryByText('ui-plugin-find-user.status')).toBeInTheDocument();
  });

  it('should render patronGroup filter groups', () => {
    expect(screen.queryByText('ui-plugin-find-user.information.patronGroup')).toBeInTheDocument();
  });

  it('should render active status filter', () => {
    expect(screen.queryByText('ui-plugin-find-user.active')).toBeInTheDocument();
  });

  it('should render inactive status filter', () => {
    expect(screen.getByText('ui-plugin-find-user.inactive')).toBeInTheDocument();
  });

  it('should call changeHandler on clicking inactive checkbox', async () => {
    const inActiveCheckbox = screen.getByRole('checkbox', { name: 'ui-plugin-find-user.inactive' });
    await userEvent.click(inActiveCheckbox);

    expect(props.onChangeHandlers.checkbox).toHaveBeenCalled();
  });
});
