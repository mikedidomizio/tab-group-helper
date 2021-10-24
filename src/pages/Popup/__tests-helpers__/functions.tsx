import { render, screen } from '@testing-library/react';
import { ReactWrapper } from 'enzyme';
import { ReactElement } from 'react';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';

// export this so we don't have to have a bunch of additional ts-ignore everywhere
export { chrome };

export const getButtonByText = (wrapper: ReactWrapper, btnText: string) =>
  wrapper.findWhere((node) => {
    return node.type() === 'button' && node.text() === btnText;
  });

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
