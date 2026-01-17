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
import {
  act,
  fireEvent,
  waitFor,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

let getInputByLabel: (field: string) => HTMLElement;
let getLineItems: () => NodeListOf<Element>;

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

  // NOTE: do not render here; tests will render and rerender as needed to avoid
  // multiple instances of Board in the same test which causes ambiguous queries.

  getInputByLabel = (fieldText: string) => {
    return screen.getByLabelText(new RegExp(fieldText));
  };

  getLineItems = () => document.querySelectorAll('.line-item');
});

afterEach(() => {
  chrome.reset();
});

test.skip('should have a line item', () =>
  expect(getLineItems().length).toBe(1));

test.skip('should add another line item on clicking the add item button', () => {
  userEvent.click(getButtonByText('Add Item'));
  expect(getLineItems().length).toBe(2);
});

test.skip('clean up should remove all non-edited (default) line items', () => {
  userEvent.click(getButtonByText('Add Item'));
  expect(getLineItems().length).toBe(2);
  userEvent.click(getButtonByText('Clean up'));
  expect(getLineItems().length).toBe(1);
});

test.skip('clean up should leave any edited line items', () => {
  userEvent.type(getInputByLabel('Contains'), 'Hello');
  userEvent.click(getButtonByText('Add Item'));
  userEvent.click(getButtonByText('Clean up'));
  expect((getInputByLabel('Contains') as HTMLInputElement).value).toBe('Hello');
});

test.skip('run should call the tabs service with each valid line item', async () => {
  // sinon-chrome package doesn't have query therefore we mock it
  chrome.tabGroups = {
    query: () => {},
  };
  let addTabsSpy = jest.spyOn(TabService.prototype, 'addTabsToGroup');
  await waitFor(() => userEvent.type(getInputByLabel('Contains'), 'Hello'));
  userEvent.click(getButtonByText('Run'));
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
  const { rerender, container } = render(<Board />);
  await act(async () => {
    await rerender(<Board />);
    await waitFor(() => within(container).getByDisplayValue('still here'));
    const buttons = within(container).getAllByRole('button', {
      name: /delete/i,
    });
    chrome.storage.local.get.yields({ lineItems: [lineItem2] });
    fireEvent.click(buttons[0]);
  });

  expect(within(container).getByDisplayValue('still here')).toBeInTheDocument();
});

test('deleting the only line item will delete the current line item and leave a blank one', async () => {
  const lineItem = newLineItem();
  lineItem.text = 'delete me';
  chrome.storage.local.get.yields({ lineItems: [lineItem] });
  const { rerender, container } = render(<Board />);
  await act(async () => {
    rerender(<Board />);
    await waitFor(() => within(container).getByDisplayValue('delete me'));
    fireEvent.click(
      within(container).getByRole('button', {
        name: /delete/i,
      })
    );
  });

  expect(within(container).queryByText('delete me')).not.toBeInTheDocument();
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

    const { rerender, container } = render(<Board />);
    await act(async () => {
      rerender(<Board />);
      await waitFor(() => within(container).getByDisplayValue('github'));
      const collapseButtons = within(container).getAllByRole('button', { name: /collapse\/expand groups/i });
      fireEvent.click(collapseButtons[0]);
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

    const { rerender, container } = render(<Board />);
    await act(async () => {
      rerender(<Board />);
      await waitFor(() => within(container).getByDisplayValue('github'));
      const collapseButtons = within(container).getAllByRole('button', { name: /collapse\/expand groups/i });
      fireEvent.click(collapseButtons[0]);
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
  await waitFor(() => userEvent.click(getButtonByText('Clear')));
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

  const { rerender, container } = render(<Board />);
  await act(async () => await rerender(<Board />));

  const allLineItems = await within(container).findAllByText(/group name/i);
  expect(allLineItems.length).toBe(2);

  const cleanButton = within(container).getAllByRole('button', {
    name: 'Removes rules that are the default for quick removal',
  })[0];
  // todo it'd be nice to use rtl or mock over the chrome.storage.local.set/get to properly keep state
  chrome.storage.local.get.yields({ lineItems: [lineItem] });

  fireEvent.click(cleanButton);
  // until we get a proper mocking of the chrome storage, we can at least unit test that the `set`
  // is called with 1 line item (after cleaned up)
  await waitFor(() => expect(setSpy).toHaveBeenCalledWith([lineItem]));

  const allLineItemsCleaned = await within(container).findAllByText(/group name/i);
  expect(allLineItemsCleaned.length).toBe(1);
});
