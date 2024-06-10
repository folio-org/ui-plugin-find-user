import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Button: jest.fn(({
    children,
    onClick = jest.fn(),
    // eslint-disable-next-line no-unused-vars
    buttonStyle, buttonRef,
    ...rest
  }) => (
    <button data-test-button type="button" {...rest} onClick={onClick}>
      <span>
        {children}
      </span>
    </button>
  )),
  Checkbox: jest.fn((props) => (
    <input
      type="checkbox"
      {...props}
    />
  )),
  FilterGroups: jest.fn(({ config, filters, onChangeFilter, onClearFilter }) => (
    <div>
      {JSON.stringify(config)}
      {JSON.stringify(filters)}
      {JSON.stringify(onChangeFilter)}
      {JSON.stringify(onClearFilter)}
    </div>
  )),
  Icon: jest.fn((props) => (props && props.children ? props.children : <span />)),
  Modal: jest.fn(({ children, label, dismissible, footer, ...rest }) => {
    return (
      <div
        data-test={dismissible ? '' : ''}
        {...rest}
      >
        <h1>{label}</h1>
        {children}
        {footer}
      </div>
    );
  }),
  MultiColumnList: jest.fn((props) => (
    <div data-testid={props['data-testid']} />
  )),
  // destructure appIcon and dismissible so they aren't incorrectly
  // applied as DOM attributes via ...rest.
  // eslint-disable-next-line no-unused-vars
  Pane: jest.fn(({ children, className, defaultWidth, paneTitle, firstMenu, lastMenu, actionMenu, appIcon, dismissible, ...rest }) => {
    return (
      <div className={className} {...rest} style={{ width: defaultWidth }}>
        <div>
          {firstMenu ?? null}
          {paneTitle}
          {actionMenu ? actionMenu({ onToggle: jest.fn() }) : null}
          {lastMenu ?? null}
        </div>
        {children}
      </div>
    );
  }),
  PaneMenu: jest.fn((props) => <div>{props.children}</div>),
  Paneset: jest.fn((props) => <div>{props.children}</div>),
  SearchField: jest.fn((props) => (
    <input
      {...props}
    />
  )),
}));
