import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Button: jest.fn(({
    children,
    onClick = jest.fn(),
    ...rest
  }) => (
    <button
      data-test-button
      type="button"
      {...rest}
      onClick={onClick}
    >
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
  Pane: jest.fn(({ children, className, defaultWidth, paneTitle, firstMenu, ...rest }) => {
    return (
      <div className={className} {...rest} style={{ width: defaultWidth }}>
        <div>
          {firstMenu ?? null}
          {paneTitle}
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
