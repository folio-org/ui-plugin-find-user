import { useRef } from 'react';
import PropTypes from 'prop-types';
import _omit from 'lodash/omit';
import className from 'classnames';
import { FormattedMessage } from 'react-intl';
import contains from 'dom-helpers/query/contains';

import { Button, Icon } from '@folio/stripes/components';

import UserSearchModal from './UserSearchModal';
import { useSetState } from './hooks';

import css from './UserSearch.css';

const PluginFindUser = (props) => {
  const {
    afterClose,
    id = 'clickable-plugin-find-user',
    searchLabel,
    searchButtonStyle = 'primary noRightRadius',
    marginBottom0,
    marginTop0,
    // eslint-disable-next-line no-unused-vars
    onModalClose,
    renderTrigger,
    // eslint-disable-next-line no-unused-vars
    dataKey = 'find_patron',
    // eslint-disable-next-line no-unused-vars
    initialSelectedUsers,
  } = props;

  const [isModalOpen, setIsModalOpen] = useSetState(false);
  const modalTrigger = useRef();
  const modalRef = useRef();

  // don't inadvertently pass in other resources which could result in resource confusion.
  const isolatedProps = _omit(props, ['parentResources', 'resources', 'mutator', 'parentMutator']);

  const getStyle = () => (
    className(
      css.searchControl,
      { [css.marginBottom0]: marginBottom0 },
      { [css.marginTop0]: marginTop0 },
    )
  );

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false, () => {
      if (afterClose) {
        afterClose();
      }

      if (modalRef.current && modalTrigger.current) {
        if (contains(modalRef.current, document.activeElement)) {
          modalTrigger.current.focus();
        }
      }
    });
  };

  const renderTriggerButton = () => (
    renderTrigger({
      buttonRef: modalTrigger,
      onClick: openModal,
    })
  );

  return (
    <div className={getStyle()} data-test-plugin-find-user>
      {renderTrigger ?
        renderTriggerButton() :
        <FormattedMessage id="ui-plugin-find-user.searchButton.title">
          {ariaLabel => (
            <Button
              id={id}
              key="searchButton"
              buttonStyle={searchButtonStyle}
              aria-label={ariaLabel}
              onClick={openModal}
              buttonRef={modalTrigger}
              marginBottom0={marginBottom0}
              data-testid="searchButton"
            >
              {searchLabel || <Icon icon="search" color="#fff" />}
            </Button>
          )}
        </FormattedMessage>}
      <UserSearchModal
        openWhen={isModalOpen}
        closeCB={closeModal}
        modalRef={modalRef}
        {...isolatedProps}
      />
    </div>
  );
};

PluginFindUser.propTypes = {
  afterClose: PropTypes.func,
  id: PropTypes.string,
  searchLabel: PropTypes.node,
  searchButtonStyle: PropTypes.string,
  marginBottom0: PropTypes.bool,
  marginTop0: PropTypes.bool,
  onModalClose: PropTypes.func,
  renderTrigger: PropTypes.func,
  dataKey: PropTypes.string,
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
};

export default PluginFindUser;
