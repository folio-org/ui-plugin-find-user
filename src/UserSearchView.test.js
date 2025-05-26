import { act, createRef } from 'react';

import { render, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import UserSearchView from './UserSearchView';

jest.unmock('@folio/stripes/components');
jest.unmock('@folio/stripes/smart-components');

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  MultiColumnList: jest.fn(({
    contentData,
    columnMapping,
    formatter,
    isEmptyMessage,
  }) => (
    <div>
      {Object.values(columnMapping).map(col => col)}
      {Object.keys(formatter).map(key => <div>{formatter[key](contentData[0])}</div>)}
      {isEmptyMessage}
    </div>
  )),
}));

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  SearchAndSortNoResultsMessage: jest.fn(() => 'NoResultsMessage'),
}));

const defaultProps = {
  data: {
    patronGroups: [],
    users: {
      records: [
        {
          id: 'id-1',
          active: false,
        },
        {
          id: 'id-2',
          active: true,
          userName: 'mockUsername',
        },
      ],
    },
  },
  initialSelectedUsers: {
    'mockUser': {
      active: false,
    },
  },
  isMultiSelect: true,
  onSaveMultiple: jest.fn(),
};

const history = createMemoryHistory();

describe('UserSearchView', () => {
  const getComponent = (props = {}) => {
    const contentRef = createRef();

    return (
      <Router history={history}>
        <UserSearchView
          {...defaultProps}
          {...props}
          contentRef={contentRef}
        />
      </Router>
    );
  };

  const renderWithProps = (props = {}) => render(getComponent(props));

  it('renders the component', () => {
    const { getByTestId } = renderWithProps();

    expect(getByTestId('user-search-view')).toBeInTheDocument();
  });

  describe('when "Select all" checkbox is selected', () => {
    describe('and user opens next page', () => {
      it('should display the unchecked "select all" checkbox', async () => {
        const { getByTestId, rerender } = renderWithProps();

        await act(() => userEvent.click(getByTestId('toggle-all-checked')));

        expect(getByTestId('row-checked')).toBeChecked();

        rerender(getComponent({
          data: {
            ...defaultProps.data,
            users: {
              records: [
                {
                  id: 'id-3'
                },
                {
                  id: 'id-4',
                },
              ],
            },
          }
        }));

        expect(getByTestId('toggle-all-checked')).not.toBeChecked();
      });

      describe('and selects the "Select all" checkbox again and saves', () => {
        it('should save all selected users from the first and the second page', async () => {
          const { getByTestId, rerender } = renderWithProps();

          await act(() => userEvent.click(getByTestId('toggle-all-checked')));

          expect(getByTestId('row-checked')).toBeChecked();

          rerender(getComponent({
            data: {
              ...defaultProps.data,
              users: {
                records: [
                  {
                    id: 'id-3'
                  },
                  {
                    id: 'id-4',
                  },
                ],
              },
            }
          }));

          await act(() => userEvent.click(getByTestId('toggle-all-checked')));
          await act(() => userEvent.click(getByTestId('save-multiple')));

          expect(defaultProps.onSaveMultiple).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ id: 'id-1' }),
            expect.objectContaining({ id: 'id-2' }),
            expect.objectContaining({ id: 'id-3' }),
            expect.objectContaining({ id: 'id-4' }),
          ]));
        });
      });
    });
  });

  it('handles checkboxes toggling', async () => {
    const { getByTestId } = renderWithProps();

    userEvent.click(getByTestId('row-checked'));

    await waitFor(() => expect(getByTestId('row-checked')).toBeChecked());

    // first click checks all entries, second unchecks all entries
    userEvent.dblClick(getByTestId('toggle-all-checked'));

    await waitFor(() => expect(getByTestId('row-checked')).not.toBeChecked());
  });

  it('toggles filter pane', async () => {
    const { getByTestId, queryByTestId } = renderWithProps({ ...defaultProps, initialSearch: 'mockInitialSearch' });

    userEvent.click(getByTestId('filter-pane-toggle'));

    await waitFor(() => expect(queryByTestId('filter-pane')).not.toBeInTheDocument());
  });

  it('saves multiple', async () => {
    const { getByTestId } = renderWithProps();

    userEvent.click(getByTestId('save-multiple'));

    await waitFor(() => expect(defaultProps.onSaveMultiple).toHaveBeenCalled());
  });

  it('renders no results message', () => {
    const { getByText } = renderWithProps({ ...defaultProps, source: 'mockSource' });

    expect(getByText('NoResultsMessage')).toBeInTheDocument();
  });

  it('renders search results count', () => {
    const { getByText } = renderWithProps({
      ...defaultProps,
      data: {
        ...defaultProps.data,
        users: {
          ...defaultProps.data.users,
          count: 9,
        },
      },
    });

    expect(getByText('stripes-smart-components.searchResultsCountHeader')).toBeInTheDocument();
  });

  it('renders inactive user status', () => {
    const { queryAllByText } = renderWithProps({
      ...defaultProps,
      data: {
        ...defaultProps.data,
        users: {
          records: [
            {
              active: true,
            },
          ],
        },
      },
    });

    expect(queryAllByText('ui-plugin-find-user.active')[0]).toBeInTheDocument();
  });

  it('renders patron group if there\'s a match', () => {
    const { getByText } = renderWithProps({
      ...defaultProps,
      data: {
        patronGroups: [
          {
            id: 'mockId',
            group: 'mockGroup',
          },
        ],
        users: {
          records: [
            {
              active: true,
              patronGroup: 'mockId',
            },
          ],
        },
      },
    });

    expect(getByText('mockGroup')).toBeInTheDocument();
  });

  it('renders save multiple control as disabled', () => {
    const { getByTestId } = renderWithProps({ ...defaultProps, initialSelectedUsers: undefined });

    expect(getByTestId('save-multiple')).toBeDisabled();
  });
});
