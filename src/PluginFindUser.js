import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _omit from 'lodash/omit';
import className from 'classnames';
import { FormattedMessage } from 'react-intl';
import contains from 'dom-helpers/query/contains';

import { Button, Icon } from '@folio/stripes/components';

import UserSearchModal from './UserSearchModal';

import css from './UserSearch.css';

class PluginFindUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openModal: false,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.modalTrigger = React.createRef();
    this.modalRef = React.createRef();
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
    const {
      afterClose
    } = this.props;

    this.setState({
      openModal: false,
    }, () => {
      if (afterClose) {
        afterClose();
      }

      if (this.modalRef.current && this.modalTrigger.current) {
        if (contains(this.modalRef.current, document.activeElement)) {
          this.modalTrigger.current.focus();
        }
      }
    });
  }

  render() {
    const { id, marginBottom0, searchButtonStyle, searchLabel } = this.props;
    // don't inadvertently pass in other resources which could result in resource confusion.
    const isolatedProps = _omit(this.props, ['parentResources', 'resources', 'mutator', 'parentMutator']);

    return (
      <div className={this.getStyle()} data-test-plugin-find-user>
        <FormattedMessage id="ui-plugin-find-user.searchButton.title">
          {ariaLabel => (
            <Button
              id={id}
              key="searchButton"
              buttonStyle={searchButtonStyle}
              aria-label={ariaLabel}
              onClick={this.openModal}
              buttonRef={this.modalTrigger}
              marginBottom0={marginBottom0}
              data-test-plugin-find-user-button
            >
              {searchLabel || <Icon icon="search" color="#fff" />}
            </Button>
          )}
        </FormattedMessage>
        <UserSearchModal
          openWhen={this.state.openModal}
          closeCB={this.closeModal}
          modalRef={this.modalRef}
          {...isolatedProps}
        />
      </div>
    );
  }
}

PluginFindUser.defaultProps = {
  id: 'clickable-plugin-find-user',
  searchButtonStyle: 'primary noRightRadius',
  dataKey: 'find_patron',
};

PluginFindUser.propTypes = {
  afterClose: PropTypes.func,
  id: PropTypes.string,
  searchLabel: PropTypes.node,
  searchButtonStyle: PropTypes.string,
  marginBottom0: PropTypes.bool,
  marginTop0: PropTypes.bool,
  onModalClose: PropTypes.func,
  dataKey: PropTypes.string,
};

export default PluginFindUser;
