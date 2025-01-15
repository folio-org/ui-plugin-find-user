import { screen, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import renderWithRouter from 'helpers/renderWithRouter';

import PluginFindUser from './PluginFindUser';

jest.unmock('@folio/stripes/components');
jest.mock('./UserSearchContainer', () => {
  return jest.fn(() => <div>UserSearchContainer</div>);
});

const afterCloseMock = jest.fn();
const renderTriggerMock = jest.fn();

const renderPluginFindUser = (props) => renderWithRouter(
  <PluginFindUser {...props} />
);

const props = {
  afterClose: afterCloseMock,
  id: 'find-user',
  searchLabel: <span>Search User</span>,
  searchButtonStyle: 'primary',
  marginBottom0: true,
  marginTop0: false,
  dataKey: 'find_patron',
  initialSelectedUsers: {
    user1: {
      username: 'jdoe',
      id: '123456',
      active: true,
      barcode: 'barcode123',
      personal: {
        lastName: 'Doe',
        firstName: 'John',
        email: 'jdoe@example.com',
      },
      patronGroup: 'Regular',
    },
  },
  stripes: {
    connect: jest.fn(),
    logger: {
      log: jest.fn(),
    },
    okapi: {
      url: 'url',
      tenant: 'tenant',
    },
  },
};

describe('PluginFindUser', () => {
  it('should render the search button', () => {
    renderPluginFindUser(props);
    expect(screen.getByTestId('searchButton')).toBeInTheDocument();
  });

  it('should display the correct search label text', () => {
    renderPluginFindUser(props);
    expect(screen.getByText('Search User')).toBeInTheDocument();
  });

  it('should display the search icon when "searchLabel" is not provided', () => {
    renderPluginFindUser({ ...props, searchLabel: undefined });
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });

  it('should trigger renderTrigger() when provided in props', () => {
    const propsWithRenderTrigger = { ...props, renderTrigger: renderTriggerMock };
    renderPluginFindUser(propsWithRenderTrigger);
    expect(renderTriggerMock).toHaveBeenCalledTimes(1);
  });

  it('should open the user search modal when the search button is clicked', async () => {
    renderPluginFindUser(props);
    const searchBtn = screen.getByTestId('searchButton');
    await userEvent.click(searchBtn);
    expect(screen.getByText('ui-plugin-find-user.modal.label')).toBeInTheDocument();
  });

  it('should trigger afterClose() when the modal is closed', async () => {
    renderPluginFindUser(props);
    const searchBtn = screen.getByTestId('searchButton');
    await userEvent.click(searchBtn);
    await userEvent.click(screen.getByRole('button', { name : 'stripes-components.dismissModal' }));
    await waitFor(() => expect(afterCloseMock).toHaveBeenCalledTimes(1));
  });
});
