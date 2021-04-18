import {render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import Enzyme, {mount, ReactWrapper} from 'enzyme';
// workaround since enzyme hasn't released for React 17.  So we use this person's workaround
// https://github.com/enzymejs/enzyme/issues/2429#issuecomment-679265564
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import {Board} from '../Board';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';
import {TabService} from '../../../service/tab.service';
import {LineItem} from '../../../service/lineItems.service';

Enzyme.configure({adapter: new Adapter()});

let wrapper: ReactWrapper;
let getButtonByText: (btnText: string) => ReactWrapper<any, any>;
let getInputByLabel: (field: string) => ReactWrapper<any, any>;

beforeAll(function () {
    global.chrome = chrome;
});

beforeEach(() => {
    // clear the local storage to keep tests independent
    localStorage.clear();
    wrapper = mount(<Board/>);
    getButtonByText = (btnText: string) => wrapper.findWhere(node => {
        return (
            node.type() === 'button' &&
            node.text() === btnText
        );
    });
    getInputByLabel = (fieldText: string) => wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    }).findWhere(node => {
        const re = new RegExp(fieldText);
        return (
            node.type() === 'div' &&
            node.text().trim().match(re) !== null &&
            node.hasClass('MuiTextField-root')
        )
    }).find('input');
});

afterEach(() => {
    wrapper.unmount();
});

test('should render the component properly', () => {
    render(<Board/>);
    const element = screen.getByText(/Add item/i);
    expect(element).toBeInTheDocument();
});

test('should have a line item', () => {
    const lineItem = wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    });
    expect(lineItem.length).toBe(1);
});

test('should add another line item on clicking the add item button', () => {
    getButtonByText('Add Item').simulate('click');
    const lineItem = wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    });
    expect(lineItem.length).toBe(2);
});

test('clean up should remove all non-edited (default) line items', () => {
    getButtonByText('Add Item').simulate('click');
    const lineItem = wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    });
    expect(lineItem.length).toBe(2);
    getButtonByText('Clean up').simulate('click');
    const lineItemAfter = wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    });
    expect(lineItemAfter.length).toBe(1);
});

test('clean up should leave any edited line items', () => {
    getInputByLabel('Contains\\s').simulate('change', {target: {name: 'text', value: 'Hello'}});
    getButtonByText('Add Item').simulate('click');
    getButtonByText('Clean up').simulate('click');
    expect(getInputByLabel('Contains\\s').props().value).toBe('Hello');
});

test('run should call the tabs service with each valid line item', async () => {
    chrome.tabs.query.yields([{id: 123, url: 'Hello-World.com'} as Partial<LineItem>]);
    // sinon-chrome package doesn't have query therefore we mock it
    chrome.tabGroups = {
        query: () => {}
    };
    let addTabsSpy = jest.spyOn(TabService.prototype, 'addTabsToGroup');
    await waitFor(() => getInputByLabel('Contains\\s').simulate('change', {target: {name: 'text', value: 'Hello'}}));
    getButtonByText('Run').simulate('click');
    await waitFor(() => expect(addTabsSpy).toHaveBeenCalledWith([123], '', undefined));
    await waitFor(() => expect(addTabsSpy).toHaveBeenCalledTimes(1));
});

test('deleting a line item should remove a line item', () => {
    getButtonByText('Add Item').simulate('click');
    getButtonByText('Add Item').simulate('click');
    // at this point we expect 3 items, then we delete 1
    wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    }).at(0).findWhere(node => {
        return (
            node.type() === 'button'
        )
    }).simulate('click');

    expect( wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    }).length).toBe(2);
});

test('deleting the only line item will delete the current line item and leave a blank one', async() => {
    getInputByLabel('Contains\\s').simulate('change', {target: {name: 'text', value: 'Hello'}});

    // check that the value was updated
    await waitFor(() => expect(getInputByLabel('Contains\\s').props().value).toBe('Hello'));

    // delete the line item
    wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    }).at(0).findWhere(node => {
        return (
            node.type() === 'button'
        )
    }).simulate('click');

    // check that the value is now reset
    await waitFor(() => expect(getInputByLabel('Contains\\s').props().value).toBe(''));
});

test('clear groups should make a chrome api request to clear all active groups', async() => {
    chrome.tabs.query.yields([{id: 123, url: 'Hello-World.com'} as Partial<LineItem>]);
    const ungroupFn = jest.fn();
    chrome.tabs.ungroup = ungroupFn;
    await waitFor(() => getButtonByText('Clear Groups').simulate('click'));
    expect(ungroupFn).toHaveBeenCalledWith([123], expect.anything());
});
