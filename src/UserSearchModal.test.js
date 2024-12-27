import { screen, render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';
import { createRef } from 'react';

import UserSearchModal from './UserSearchModal';

jest.unmock('@folio/stripes/components');

jest.mock('./UserSearchContainer', () => {
  return jest.fn(() => <div>UserSearchContainer</div>);
});

const props = {
  stripes: {
    connect: jest.fn(),
    okapi: {
      tenant: 'diku',
    },
  },
  selectUsers: jest.fn(),
  selectUser: jest.fn(),
  closeCB: jest.fn(),
  onCloseModal: jest.fn(),
  openWhen: true,
  restoreFocus: true,
  initialSelectedUsers: undefined,
  tenantId: 'diku',
};

describe('UserSearchModal', () => {
  beforeEach(() => {
    const modalRef = createRef();

    render(<UserSearchModal {...props} modalRef={modalRef} />);
  });

  it('should display search label', () => {
    expect(screen.getByText('ui-plugin-find-user.modal.label')).toBeInTheDocument();
  });

  it('should render "UserSearchContainer"', () => {
    expect(screen.getByText('UserSearchContainer')).toBeInTheDocument();
  });

  it('close modal on clicking close button', async () => {
    const button = screen.getByRole('button', { name: 'stripes-components.dismissModal' });
    expect(button).toBeInTheDocument();

    userEvent.click(button);
    await waitFor(() => expect(props.closeCB).toHaveBeenCalled());
  });
});
