import React from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import className from 'classnames';

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

  getStyle() {
    const { marginBottom0, marginTop0 } = this.props;
    return className(
      css.searchControl,
      { [css.marginBottom0]: marginBottom0 },
      { [css.marginTop0]: marginTop0 },
    );
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
      <div className={this.getStyle()}>
        <Button
          id="clickable-plugin-find-user"
          key="searchButton"
          buttonStyle={this.props.searchButtonStyle}
          onClick={this.openModal}
          title="Find User"
          tabIndex="-1"
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
  marginBottom0: PropTypes.bool,
  marginTop0: PropTypes.bool,
};
