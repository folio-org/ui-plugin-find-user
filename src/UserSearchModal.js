import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { Modal } from '@folio/stripes/components';

import UserSearchContainer from './UserSearchContainer';
import UserSearchView from './UserSearchView';
import { UsersShape } from './shapes';

import css from './UserSearch.css';

class UserSearchModal extends Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
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
    initialSelectedUsers: UsersShape,
  }

  static defaultProps = {
    restoreFocus: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      error: null,
    };

    this.closeModal = this.closeModal.bind(this);
    this.passUserOut = this.passUserOut.bind(this);
    this.modalRef = props.modalRef || React.createRef();
  }

  closeModal() {
    this.setState({
      error: null,
    }, () => {
      this.props.closeCB();
    });
  }

  passUserOut(e, user) {
    this.props.selectUser(user);

    if (!user.error) {
      this.closeModal();
    } else {
      this.setState({
        error: user.error,
      });
    }
  }

  passUsersOut = users => {
    this.props.selectUsers(users);
    this.closeModal();
  }

  render() {
    const {
      restoreFocus,
      onCloseModal,
      openWhen,
      selectUsers,
      initialSelectedUsers,
    } = this.props;

    return (
      <Modal
        contentClass={css.modalContent}
        dismissible
        enforceFocus={false}
        label={<FormattedMessage id="ui-plugin-find-user.modal.label" />}
        open={openWhen}
        ref={this.modalRef}
        size="large"
        onClose={this.closeModal}
        restoreFocus={restoreFocus}
      >
        {this.state.error ? <div className={css.userError}>{this.state.error}</div> : null}
        <UserSearchContainer {...this.props} onComponentWillUnmount={onCloseModal}>
          {(viewProps) => <UserSearchView
            {...viewProps}
            onSaveMultiple={this.passUsersOut}
            onSelectRow={this.passUserOut}
            isMultiSelect={Boolean(selectUsers)}
            initialSelectedUsers={initialSelectedUsers}
          />}
        </UserSearchContainer>
      </Modal>
    );
  }
}

export default UserSearchModal;
