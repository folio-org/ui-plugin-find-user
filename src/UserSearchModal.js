import { useState, useRef, forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Modal } from '@folio/stripes/components';

import UserSearchContainer from './UserSearchContainer';
import UserSearchView from './UserSearchView';

import css from './UserSearch.css';

const UserSearchModal = (
  (
    {
      stripes,
      selectUsers,
      selectUser,
      closeCB,
      onCloseModal,
      openWhen,
      restoreFocus = true,
      initialSelectedUsers,
      tenantId,
      ...rest
    },
    modalRef
  ) => {
    const [error, setError] = useState(null);
    const [callbackTrigger, setCallbackTrigger] = useState(false);
    const ref = useRef();
    const mRef = modalRef || ref;

    useEffect(() => {
      if (callbackTrigger && error === null) {
        closeCB();
        setCallbackTrigger(false);
      }
    }, [callbackTrigger, error, closeCB]);

    const closeModal = () => {
      setError(null);
      setCallbackTrigger(true); // Trigger the callback after state update
    };

    const passUserOut = (e, user) => {
      selectUser(user);

      if (!user.error) {
        closeModal();
      } else {
        setError(user.error);
      }
    };

    const passUsersOut = users => {
      selectUsers(users);
      closeModal();
    };

    return (
      <Modal
        contentClass={css.modalContent}
        dismissible
        enforceFocus={false}
        label={<FormattedMessage id="ui-plugin-find-user.modal.label" />}
        open={openWhen}
        ref={mRef}
        size="large"
        onClose={closeModal}
        restoreFocus={restoreFocus}
      >
        {error ? <div className={css.userError}>{error}</div> : null}
        <UserSearchContainer
          stripes={stripes}
          selectUsers={selectUsers}
          selectUser={selectUser}
          closeCB={closeCB}
          onCloseModal={onCloseModal}
          openWhen={openWhen}
          restoreFocus={restoreFocus}
          onComponentWillUnmount={onCloseModal}
          tenantId={tenantId || stripes.okapi.tenant}
          initialSelectedUsers={initialSelectedUsers}
          {...rest}
        >
          {(viewProps) => <UserSearchView
            {...viewProps}
            onSaveMultiple={passUsersOut}
            onSelectRow={passUserOut}
            isMultiSelect={Boolean(selectUsers)}
            initialSelectedUsers={initialSelectedUsers}
          />}
        </UserSearchContainer>
      </Modal>
    );
  });

UserSearchModal.propTypes = {
  stripes: PropTypes.shape({
    connect: PropTypes.func.isRequired,
    okapi: PropTypes.object.isRequired,
  }).isRequired,
  selectUsers: PropTypes.func,
  selectUser: PropTypes.func,
  closeCB: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func,
  openWhen: PropTypes.bool,
  dataKey: PropTypes.string,
  contentRef: PropTypes.object,
  modalRef: PropTypes.object,
  restoreFocus: PropTypes.bool,
  initialSelectedUsers: PropTypes.shape({
    [PropTypes.string]: PropTypes.shape({
      username: PropTypes.string,
      id: PropTypes.string,
      active: PropTypes.bool,
      barcode: PropTypes.string,
      personal: PropTypes.shape({
        lastName: PropTypes.string,
        firstName: PropTypes.string,
        email: PropTypes.string,
      }),
      patronGroup: PropTypes.string,
    }),
  }),
  tenantId: PropTypes.string,
};

export default forwardRef(UserSearchModal);
