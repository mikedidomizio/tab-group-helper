import packageJSON from '../../../../../../package.json';
import { chrome } from '../../../__tests-helpers__/functions';
import { Help } from '../Help';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

beforeAll(function () {
  // @ts-ignore
  global.chrome = chrome;
});

test('should include a link to the webstore package', () => {
  render(<Help />);

  userEvent.click(screen.getByRole('link', { name: /chrome web store link/i }));

  expect(
    chrome.tabs.create.withArgs({ url: packageJSON.repository.url })
  ).toBeTruthy();
});

test('should include a link that opens a new tab to the github repo', () => {
  const url =
    'https://chrome.google.com/webstore/detail/tab-group-helper/llhkcebnebfiaamifhbpehjompplpnae';

  render(<Help />);

  userEvent.click(screen.getByRole('link', { name: /github page/i }));

  expect(chrome.tabs.create.withArgs({ url })).toBeTruthy();
});

test('should include a link to the general page', () => {
  const url = 'pages/general.html';

  render(<Help />);

  userEvent.click(
    screen.getByRole('link', { name: /general\/help page with instructions/i })
  );

  expect(chrome.tabs.create.withArgs({ url })).toBeTruthy();
});
