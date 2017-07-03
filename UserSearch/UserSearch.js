import React from 'react';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import css from './UserSearch.css';

import UserSearchModal from './UserSearchModal';

export default class UserSearch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      openModal: false,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({
      openModal: true,
    });
  }

  closeModal() {
    this.setState({
      openModal: false,
    });
  }

  render() {
    return (
      <div className={css.searchControl} style={{ display: 'flex' }}>
        <Button
          key="searchButton"
          onClick={this.openModal}
          title="Find User" tabIndex="-1"
        >
          <Icon icon="search" color="#fff" />
        </Button>
        <UserSearchModal
          openWhen={this.state.openModal}
          closeCB={this.closeModal}
          {...this.props}
        />
      </div>
    );
  }

}
