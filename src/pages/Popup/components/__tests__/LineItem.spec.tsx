import '../../__tests-helpers__/enzyme-adapter';
import { chrome } from '../../__tests-helpers__/functions';
import { newLineItem } from '../../service/lineItems.service';
import { LineItem, LineItemProps } from '../LineItem';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

let wrapper: ReactWrapper;

let getInputByLabel: (field: string) => ReactWrapper<any, any>;
let setDropdownByLabelValue: (
  label: string,
  value: string
) => ReactWrapper<any, any>;
let setCheckboxByLabelValue: (
  label: string,
  checked: boolean
) => ReactWrapper<any, any>;

beforeAll(function () {
  global.chrome = chrome;
});

beforeEach(() => {
  getInputByLabel = (fieldText: string) =>
    wrapper
      .findWhere((node) => {
        return (
          node.hasClass('MuiTextField-root') &&
          node.text().trim().includes(fieldText)
        );
      })
      .find('input');

  setDropdownByLabelValue = (label: string, value: string) =>
    wrapper
      .findWhere((node) => {
        return (
          node.hasClass('MuiFormControl-root') &&
          node.text().trim().includes(label)
        );
      })
      .find('input')
      .simulate('change', { target: { name: 'text', value } });

  setCheckboxByLabelValue = (label: string, checked: boolean) =>
    wrapper
      .findWhere((node) => {
        return (
          node.hasClass('MuiFormControlLabel-root') &&
          node.text().trim().includes(label)
        );
      })
      .find('input')
      .simulate('change', { target: { checked } });
});

let lineItemChangeFn = jest.fn();

const props: LineItemProps = {
  deleteLineItem: () => {},
  onLineItemChange: lineItemChangeFn,
  ...newLineItem(),
};

beforeEach(() => {
  wrapper = mount(<LineItem {...props} />);
});

afterEach(() => {
  wrapper.unmount();
});

test('changing a line item value should call the parent onLineItemChange', () => {
  setDropdownByLabelValue('Type', 'url');
  getInputByLabel('Contains').simulate('change', {
    target: { name: 'text', value: 'World' },
  });
  setCheckboxByLabelValue('Case Sensitive', true);
  setCheckboxByLabelValue('Regex', true);
  getInputByLabel('Group Name').simulate('change', {
    target: { name: 'text', value: 'Foo' },
  });
  setDropdownByLabelValue('Color', 'red');
  setCheckboxByLabelValue('Apply', true);
  expect(lineItemChangeFn).toHaveBeenCalledTimes(7);
});
