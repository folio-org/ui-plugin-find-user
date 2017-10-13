import React from 'react';
import PropTypes from 'prop-types';
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
      <div className={css.searchControl}>
        <Button
          key="searchButton"
          buttonStyle={this.props.searchButtonStyle}
          onClick={this.openModal}
          title="Find User" tabIndex="-1"
        >
          {this.props.searchLabel ? this.props.searchLabel : <Icon icon="search" color="#fff" />}
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

UserSearch.defaultProps = {
  searchButtonStyle: 'primary noRightRadius',
};

UserSearch.propTypes = {
  searchLabel: PropTypes.string,
  searchButtonStyle: PropTypes.string,
};
