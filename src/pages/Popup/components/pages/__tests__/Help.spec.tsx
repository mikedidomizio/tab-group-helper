import packageJSON from '../../../../../../package.json';
import '../../../__tests-helpers__/enzyme-adapter';
import { chrome } from '../../../__tests-helpers__/functions';
import { Help } from '../Help';
import { render, screen } from '@testing-library/react';
import { mount } from 'enzyme';

beforeAll(function () {
  // @ts-ignore
  global.chrome = chrome;
});

test('should include a link to the webstore package', () => {
  const wrapper = mount(<Help />);
  wrapper.find(`a[href="${packageJSON.repository.url}"]`).simulate('click');
  expect(
    chrome.tabs.create.withArgs({ url: packageJSON.repository.url })
  ).toBeTruthy();
});

test('should include a link that opens a new tab to the github repo', () => {
  const url =
    'https://chrome.google.com/webstore/detail/tab-group-helper/llhkcebnebfiaamifhbpehjompplpnae';
  const wrapper = mount(<Help />);
  wrapper.find(`a[href="${url}"]`).simulate('click');
  expect(chrome.tabs.create.withArgs({ url })).toBeTruthy();
});

test('should include a link to the general page', () => {
  render(<Help />);
  expect(
    screen.getByRole('link', { name: /general\/help page with instructions/i })
  ).toBeInTheDocument();
});
