import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const UsersShape = PropTypes.shape({
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
});
