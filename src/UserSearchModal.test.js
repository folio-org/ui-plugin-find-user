import { screen, render } from '@folio/jest-config-stripes/testing-library/react';
import { useRef } from 'react';

import UserSearchModal from './UserSearchModal';

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
  initialSelectedUsers,
  tenantId: 'diku',
}; 

describe('UserSearchModal', () => {
  beforeEach(() => {
    const modalRef = useRef();

    render(<UserSearchModal  {...props} modalRef={modalRef} />);
  });

  it('should display search label', () => {
    expect(screen.getByText('ui-plugin-find-user.searchFieldLabel')).toBeInTheDocument();
  });

  it('should render "UserSearchContainer"', () => {
    expect(screen.getByText('UserSearchContainer')).toBeInTheDocument();
  });

  it('close modal on clicking close button', () => {
    const button = screen.getByRole('button', { name: 'Dismiss modal' });
    expect(button).toBeInTheDocument();

    button.click();
    expect(screen.getByText('UserSearchContainer')).not.toBeInTheDocument();
  });
});
