import { chrome } from './__tests-helpers__/functions';
// use RTL instead of Enzyme
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @ts-ignore
import { createMemoryHistory } from 'history';
// @ts-ignore
let agentGetter: SpyInstance;

beforeAll(function () {
  // @ts-ignore
  global.chrome = chrome;
});

jest.mock('history');

let pathFn: jest.Mock;

afterEach(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  pathFn = jest.fn().mockImplementation(() => {});

  createMemoryHistory.mockImplementation(() => {
    return {
      location: {
        pathname: '/',
      },
      push: pathFn,
    };
  });
});

test.skip('header menu links should update the history which will change the page', () => {
  jest.isolateModules(() => {
    const App = require('./Popup').default;
    const { container } = render(<App />);
    const menuLinkClickAndExpect = (linkName: string, expectedPath: string) => {
      userEvent.click(container.querySelector('header button')!);
      userEvent.click(screen.getByText(linkName));
      expect(pathFn).toHaveBeenCalledWith(expectedPath);
    };

    menuLinkClickAndExpect('Home', '/');
    menuLinkClickAndExpect('Manually Edit', '/edit');
    menuLinkClickAndExpect('Help', '/help');
  });
});
