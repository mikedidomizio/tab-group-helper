import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import {LineItem, LineItemProps} from '../LineItem';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';
import '../../__tests-helpers__/enzyme-adapter';
import {ChromeTabsAttributes} from '../../service/lineItems.service';

let wrapper: ReactWrapper;

let getInputByLabel: (field: string) => ReactWrapper<any, any>;
let setDropdownByLabelValue: (label: string, value: string) => ReactWrapper<any, any>;
let setCheckboxByLabelValue: (label: string, checked: boolean) => ReactWrapper<any, any>;

beforeAll(function () {
    global.chrome = chrome;
});

beforeEach(() => {
    getInputByLabel = (fieldText: string) => wrapper.findWhere(node => {
        const re = new RegExp(fieldText);
        return (
            node.type() === 'div' &&
            node.text().trim().match(re) !== null &&
            node.hasClass('MuiTextField-root')
        )
    }).find('input');
    setDropdownByLabelValue = (label: string, value: string) => wrapper.findWhere(node => {
        return (
            node.hasClass('MuiFormControl-root') &&
            node.text().trim().includes(label)
        )
    }).find('input').simulate('change', {target: {name: 'text', value}})
    setCheckboxByLabelValue = (label: string, checked: boolean) => wrapper.findWhere(node => {
        return (
            node.hasClass('MuiFormControlLabel-root') &&
            node.text().trim().includes(label)
        )
    }).find('input').simulate('change', {target: {checked}});
});

let lineItemChangeFn = jest.fn();

const props: LineItemProps = {
    deleteLineItem: () => {
    },
    onLineItemChange: lineItemChangeFn,
    applyChanges: true,
    caseSensitive: false,
    color: '',
    groupTitle: '',
    id: -1,
    matchType: ChromeTabsAttributes.url,
    regex: true,
    text: '',
}

beforeEach(() => {
    wrapper = mount(<LineItem {...props}/>);
});

afterEach(() => {
    wrapper.unmount();
});

test('changing a line item value should call the parent onLineItemChange', () => {
    setDropdownByLabelValue('Type', 'url');
    getInputByLabel('Contains').simulate('change', {target: {name: 'text', value: 'World'}});
    setCheckboxByLabelValue('Case Sensitive', true);
    setCheckboxByLabelValue('Regex', true);
    getInputByLabel('Group Name').simulate('change', {target: {name: 'text', value: 'Foo'}});
    setDropdownByLabelValue('Color', 'red');
    setCheckboxByLabelValue('Apply', true);
    expect(lineItemChangeFn).toHaveBeenCalledTimes(7);
});
