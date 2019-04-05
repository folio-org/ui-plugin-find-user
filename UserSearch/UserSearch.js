import React, { Component } from 'react';
import PropTypes from 'prop-types';
import className from 'classnames';
import { FormattedMessage } from 'react-intl';

import { Button, Icon } from '@folio/stripes/components';

import UserSearchModal from './UserSearchModal';

import css from './UserSearch.css';

class UserSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openModal: false,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.searchButton = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      afterClose
    } = this.props;

    if (prevState.openModal && this.state.openModal === false) {
      if (afterClose) {
        afterClose();
      }
    }
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
    const { id, searchButtonStyle, searchLabel } = this.props;

    return (
      <div className={this.getStyle()} data-test-plugin-find-user>
        <FormattedMessage id="ui-plugin-find-user.searchButton.title">
          {ariaLabel => (
            <Button
              id={id}
              key="searchButton"
              buttonStyle={searchButtonStyle}
              tabIndex="-1"
              aria-label={ariaLabel}
              onClick={this.openModal}
              buttonRef={this.searchButton}
              data-test-plugin-find-user-button
            >
              {searchLabel || <Icon icon="search" color="#fff" />}
            </Button>
          )}
        </FormattedMessage>
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
  id: 'clickable-plugin-find-user',
  searchButtonStyle: 'primary noRightRadius',
};

UserSearch.propTypes = {
  afterClose: PropTypes.func,
  id: PropTypes.string,
  searchLabel: PropTypes.node,
  searchButtonStyle: PropTypes.string,
  marginBottom0: PropTypes.bool,
  marginTop0: PropTypes.bool,
  onModalClose: PropTypes.func,
};

export default UserSearch;
