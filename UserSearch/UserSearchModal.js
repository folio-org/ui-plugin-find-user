import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Users from '@folio/users/src/Users';
import { Modal } from '@folio/stripes/components';
import packageInfo from '../package';

import css from './UserSearch.css';

class UserSearchModal extends Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    selectUser: PropTypes.func.isRequired,
    closeCB: PropTypes.func.isRequired,
    onCloseModal: PropTypes.func,
    openWhen: PropTypes.bool,
    dataKey: PropTypes.string,
  }

  constructor(props) {
    super(props);

    const dataKey = props.dataKey;
    this.connectedApp = props.stripes.connect(Users, { dataKey });

    this.state = {
      error: null,
    };

    this.closeModal = this.closeModal.bind(this);
    this.passUserOut = this.passUserOut.bind(this);
  }

  closeModal() {
    this.props.closeCB();
    this.setState({
      error: null,
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

  render() {
    return (
      <Modal
        contentClass={css.modalContent}
        dismissible
        enforceFocus={false}
        label={<FormattedMessage id="ui-plugin-find-user.modal.label" />}
        open={this.props.openWhen}
        size="large"
        onClose={this.closeModal}
      >
        {this.state.error ? <div className={css.userError}>{this.state.error}</div> : null}
        <this.connectedApp {...this.props} packageInfo={packageInfo} onSelectRow={this.passUserOut} onComponentWillUnmount={this.props.onCloseModal} showSingleResult={false} browseOnly />
      </Modal>
    );
  }
}

export default UserSearchModal;
