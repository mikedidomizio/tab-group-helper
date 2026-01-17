import { LineItem } from '../service/lineItems.service';
import { render, screen, within, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';

// export this so we don't have to have a bunch of additional ts-ignore everywhere
export { chrome };

// Find a button either by accessible name (preferred) or by visible text.
// If a scoped RenderResult is provided, search within that container.
export const getButtonByText = (btnText: string, scope?: RenderResult) => {
  const searchWithin = scope && scope.container ? within(scope.container) : screen;
  try {
    return searchWithin.getByRole('button', { name: btnText });
  } catch (e) {
    // fallback: find an element with the text and resolve to its closest button ancestor
    const el = searchWithin.getByText(btnText);
    const btn = el.closest('button');
    if (btn) return btn as HTMLButtonElement;
    // if no ancestor button, return the element itself
    return el as HTMLElement;
  }
};

export const renderComponentAndExpect = (
  component: ReactElement,
  expectString: RegExp
) => {
  render(component);
  const element = screen.getByText(expectString);
  expect(element).toBeInTheDocument();
};

// will be useful if we ever expand on what attributes we can match
export const generateFakeTab = (newFakeTabArgs: Partial<chrome.tabs.Tab>) => {
  return Object.assign(
    {
      id: Math.floor(Math.random() * 100000 + 1),
      title: 'my fake tab',
      url: 'https://google.ca',
    },
    newFakeTabArgs
  );
};

// the sinon-chrome stubbing doesn't support Chrome Manifest V3 returning promises
// therefore we overwrite the query getter
export const chromeTabsQueryPromiseResponse = (
  lineItems: Partial<LineItem>[]
) => {
  Object.defineProperty(chrome.tabs, 'query', {
    value: () => Promise.resolve(lineItems),
    writable: false,
  });
};
