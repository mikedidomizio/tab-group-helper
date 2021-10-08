import {act, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {mount, ReactWrapper} from 'enzyme';
import {Board} from '../Board';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';
import {TabService} from '../../../service/tab.service';
import { LineItem, newLineItem } from '../../../service/lineItems.service';
import {getButtonByText} from '../../../__tests-helpers__/functions';
import '../../../__tests-helpers__/enzyme-adapter';

let wrapper: ReactWrapper;
let getInputByLabel: (field: string) => ReactWrapper<any, any>;
let clickDeleteButton: () => ReactWrapper<any, any>;
let getLineItems: () => ReactWrapper<any, any>;

beforeAll(function () {
    global.chrome = chrome;
});

beforeEach(() => {
    // clear the local storage to keep tests independent
    localStorage.clear();
    wrapper = mount(<Board/>);
    getInputByLabel = (fieldText: string) => {
        return getLineItems().findWhere(node => {
            const re = new RegExp(fieldText);
            return (
              node.type() === 'div' &&
              node.text().trim().match(re) !== null &&
              node.hasClass('MuiTextField-root')
            )
        }).find('input');
    }
    clickDeleteButton = () => getLineItems().at(0).findWhere(node => {
        return (
            node.type() === 'button'
        )
    }).simulate('click');
    getLineItems = () => wrapper.findWhere(node => {
        return (
            node.type() === 'div' &&
            node.hasClass('line-item')
        );
    });
});

afterEach(() => {
    wrapper.unmount();
});

test.skip('should have a line item', () => expect(getLineItems().length).toBe(1));

test.skip('should add another line item on clicking the add item button', () => {
    getButtonByText(wrapper, 'Add Item').simulate('click');
    expect(getLineItems().length).toBe(2);
});

test.skip('clean up should remove all non-edited (default) line items', () => {
    getButtonByText(wrapper, 'Add Item').simulate('click');
    expect(getLineItems().length).toBe(2);
    getButtonByText(wrapper, 'Clean up').simulate('click');
    expect(getLineItems().length).toBe(1);
});

test.skip('clean up should leave any edited line items', () => {
    getInputByLabel('Contains\\s').simulate('change', {target: {name: 'text', value: 'Hello'}});
    getButtonByText(wrapper, 'Add Item').simulate('click');
    getButtonByText(wrapper, 'Clean up').simulate('click');
    expect(getInputByLabel('Contains\\s').props().value).toBe('Hello');
});

test.skip('run should call the tabs service with each valid line item', async () => {
    chrome.tabs.query.yields([{id: 123, url: 'Hello-World.com'} as Partial<LineItem>]);
    // sinon-chrome package doesn't have query therefore we mock it
    chrome.tabGroups = {
        query: () => {
        }
    };
    let addTabsSpy = jest.spyOn(TabService.prototype, 'addTabsToGroup');
    await waitFor(() => getInputByLabel('Contains\\s').simulate('change', {target: {name: 'text', value: 'Hello'}}));
    getButtonByText(wrapper, 'Run').simulate('click');
    await waitFor(() => expect(addTabsSpy).toHaveBeenCalledWith([123], '', undefined));
    await waitFor(() => expect(addTabsSpy).toHaveBeenCalledTimes(1));
});

test('deleting a line item should remove a line item', async() => {
    const lineItem = newLineItem();
    const lineItem2 = newLineItem();
    lineItem.text = 'delete me';
    lineItem2.text = 'still here';
    chrome.storage.local.get.yields({ lineItems: [lineItem, lineItem2] });
    chrome.storage.local.set.yields({});
    const {rerender} = render(<Board/>);
    await act(async() => {
        await rerender(<Board/>);
        await waitFor(() => screen.getByDisplayValue('still here'));
        const buttons = screen.getAllByRole('button', {
            name: /delete/i
        });
        chrome.storage.local.get.yields({ lineItems: [lineItem2] });
        fireEvent.click(buttons[0]);
    });

    expect(screen.getByDisplayValue('still here')).toBeInTheDocument()
});

afterEach(() => {
    chrome.reset();
})

test('deleting the only line item will delete the current line item and leave a blank one', async () => {
    const lineItem = newLineItem();
    lineItem.text = 'delete me';
    chrome.storage.local.get.yields({ lineItems: [lineItem] });
    const {rerender} = render(<Board/>);
    await act(async() => {
        rerender(<Board/>);
        await waitFor(() => screen.getByDisplayValue('delete me'))
        fireEvent.click(screen.getByRole('button', {
            name: /delete/i
        }));
    });

    expect(screen.queryByText('delete me')).not.toBeInTheDocument();
});

test('clear groups should make a chrome api request to clear all active groups', async () => {
    chrome.tabs.query.yields([{id: 123, url: 'Hello-World.com'} as Partial<LineItem>]);
    const ungroupFn = jest.fn();
    chrome.tabs.ungroup = ungroupFn;
    await waitFor(() => getButtonByText(wrapper, 'Clear Groups').simulate('click'));
    expect(ungroupFn).toHaveBeenCalledWith([123], expect.anything());
});
