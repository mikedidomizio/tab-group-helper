import '../../../__tests-helpers__/enzyme-adapter';
import {
  chrome,
  chromeTabsQueryPromiseResponse,
  getButtonByText,
} from '../../../__tests-helpers__/functions';
import {
  LineItem,
  LineItemsService,
  newLineItem,
} from '../../../service/lineItems.service';
import { TabService } from '../../../service/tab.service';
import { Board } from '../Board';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

let wrapper: ReactWrapper;
let getInputByLabel: (field: string) => ReactWrapper<any, any>;
let clickDeleteButton: () => ReactWrapper<any, any>;
let getLineItems: () => ReactWrapper<any, any>;

jest.setTimeout(30000);

beforeAll(function () {
  global.chrome = chrome;
});

beforeEach(() => {
  // clear the local storage to keep tests independent
  localStorage.clear();

  chromeTabsQueryPromiseResponse([
    { id: 123, url: 'Hello-World.com' } as Partial<LineItem>,
  ]);

  // todo remove enzyme
  wrapper = mount(<Board />);
  getInputByLabel = (fieldText: string) => {
    return getLineItems()
      .findWhere((node) => {
        const re = new RegExp(fieldText);
        return (
          node.type() === 'div' &&
          node.text().trim().match(re) !== null &&
          node.hasClass('MuiTextField-root')
        );
      })
      .find('input');
  };
  clickDeleteButton = () =>
    getLineItems()
      .at(0)
      .findWhere((node) => {
        return node.type() === 'button';
      })
      .simulate('click');
  getLineItems = () =>
    wrapper.findWhere((node) => {
      return node.type() === 'div' && node.hasClass('line-item');
    });
});

afterEach(() => {
  wrapper.unmount();
  chrome.reset();
});

test.skip('should have a line item', () =>
  expect(getLineItems().length).toBe(1));

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
  getInputByLabel('Contains\\s').simulate('change', {
    target: { name: 'text', value: 'Hello' },
  });
  getButtonByText(wrapper, 'Add Item').simulate('click');
  getButtonByText(wrapper, 'Clean up').simulate('click');
  expect(getInputByLabel('Contains\\s').props().value).toBe('Hello');
});

test.skip('run should call the tabs service with each valid line item', async () => {
  // sinon-chrome package doesn't have query therefore we mock it
  chrome.tabGroups = {
    query: () => {},
  };
  let addTabsSpy = jest.spyOn(TabService.prototype, 'addTabsToGroup');
  await waitFor(() =>
    getInputByLabel('Contains\\s').simulate('change', {
      target: { name: 'text', value: 'Hello' },
    })
  );
  getButtonByText(wrapper, 'Run').simulate('click');
  await waitFor(() =>
    expect(addTabsSpy).toHaveBeenCalledWith([123], '', undefined)
  );
  await waitFor(() => expect(addTabsSpy).toHaveBeenCalledTimes(1));
});

test('deleting a line item should remove a line item', async () => {
  const lineItem = newLineItem();
  const lineItem2 = newLineItem();
  lineItem.text = 'delete me';
  lineItem2.text = 'still here';
  chrome.storage.local.get.yields({ lineItems: [lineItem, lineItem2] });
  chrome.storage.local.set.yields({});
  const { rerender } = render(<Board />);
  await act(async () => {
    await rerender(<Board />);
    await waitFor(() => screen.getByDisplayValue('still here'));
    const buttons = screen.getAllByRole('button', {
      name: /delete/i,
    });
    chrome.storage.local.get.yields({ lineItems: [lineItem2] });
    fireEvent.click(buttons[0]);
  });

  expect(screen.getByDisplayValue('still here')).toBeInTheDocument();
});

test('deleting the only line item will delete the current line item and leave a blank one', async () => {
  const lineItem = newLineItem();
  lineItem.text = 'delete me';
  chrome.storage.local.get.yields({ lineItems: [lineItem] });
  const { rerender } = render(<Board />);
  await act(async () => {
    rerender(<Board />);
    await waitFor(() => screen.getByDisplayValue('delete me'));
    fireEvent.click(
      screen.getByRole('button', {
        name: /delete/i,
      })
    );
  });

  expect(screen.queryByText('delete me')).not.toBeInTheDocument();
});

describe('collapsing groups', () => {
  let updateSpy: jest.SpyInstance;

  beforeEach(() => {
    chrome.tabGroups = {
      update: () => {},
    };
    updateSpy = jest.spyOn(chrome.tabGroups, 'update');

    const lineItem = newLineItem();
    lineItem.groupTitle = 'git';
    lineItem.text = 'github';
    chrome.storage.local.get.yields({ lineItems: [lineItem] });
  });

  test('will make a chrome api request to collapse all the groups', async () => {
    // sinon-chrome package doesn't have therefore we mock it
    chrome.tabGroups.query = () =>
      Promise.resolve([
        {
          collapsed: false,
          id: 123,
          title: 'github-group',
          windowId: -2,
        },
        {
          collapsed: false,
          id: 555,
          title: 'facebook-group',
          windowId: -2,
        },
      ]);

    const { rerender } = render(<Board />);
    await act(async () => {
      rerender(<Board />);
      await waitFor(() => screen.getByDisplayValue('github'));
      fireEvent.click(
        screen.getByRole('button', { name: /collapse\/expand groups/i })
      );
    });

    expect(updateSpy).toHaveBeenCalledWith(123, {
      collapsed: true,
    });
  });

  test('will make chrome api request to non collapse if all groups are already collapsed', async () => {
    // sinon-chrome package doesn't have therefore we mock it
    chrome.tabGroups.query = () =>
      Promise.resolve([
        {
          collapsed: true,
          id: 123,
          title: 'github-group',
          windowId: -2,
        },
        {
          collapsed: true,
          id: 555,
          title: 'facebook-group',
          windowId: -2,
        },
      ]);

    const { rerender } = render(<Board />);
    await act(async () => {
      rerender(<Board />);
      await waitFor(() => screen.getByDisplayValue('github'));
      fireEvent.click(
        screen.getByRole('button', { name: /collapse\/expand groups/i })
      );
    });

    expect(updateSpy).toHaveBeenCalledWith(123, {
      collapsed: false,
    });
    expect(updateSpy).toHaveBeenCalledWith(555, {
      collapsed: false,
    });
  });
});

test.skip('clear groups should make a chrome api request to clear all active groups', async () => {
  const ungroupFn = jest.fn();
  chrome.tabs.ungroup = ungroupFn;
  await waitFor(() => getButtonByText(wrapper, 'Clear').simulate('click'));
  expect(ungroupFn).toHaveBeenCalledWith([123]);
});

test('cleaning up the groups should remove any groups that are the default state', async () => {
  const lineItem = newLineItem();
  lineItem.text = 'this should still exist after clean';
  chrome.storage.local.get.yields({ lineItems: [lineItem, newLineItem()] });
  chrome.storage.local.set.yields({});
  jest
    .spyOn(React, 'useState')
    .mockReturnValue([[lineItem, newLineItem()], () => {}]);
  const setSpy = jest.spyOn(LineItemsService.prototype, 'set');

  const { rerender } = render(<Board />);
  await act(async () => await rerender(<Board />));

  const allLineItems = await screen.findAllByText(/group name/i);
  expect(allLineItems.length).toBe(2);

  const cleanButton = screen.getByRole('button', {
    name: 'Removes rules that are the default for quick removal',
  });
  // todo it'd be nice to use rtl or mock over the chrome.storage.local.set/get to properly keep state
  chrome.storage.local.get.yields({ lineItems: [lineItem] });

  fireEvent.click(cleanButton);
  // until we get a proper mocking of the chrome storage, we can at least unit test that the `set`
  // is called with 1 line item (after cleaned up)
  await waitFor(() => expect(setSpy).toHaveBeenCalledWith([lineItem]));

  const allLineItemsCleaned = await screen.findAllByText(/group name/i);
  expect(allLineItemsCleaned.length).toBe(1);
});
