import React from 'react';
import PropTypes from 'prop-types';
import Users from '@folio/users/Users';
import Modal from '@folio/stripes-components/lib/Modal';

import css from './UserSearch.css';

export default class UserSearchModal extends React.Component {
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
      <Modal onClose={this.closeModal} size="large" open={this.props.openWhen} label="Select User" dismissible>
        <div className={css.userSearchModal}>
          {this.state.error ? <div className={css.userError}>{this.state.error}</div> : null}
          <this.connectedApp {...this.props} onSelectRow={this.passUserOut} onComponentWillUnmount={this.props.onCloseModal} showSingleResult={false} />
        </div>
      </Modal>
    );
  }
}
