import {render, screen} from '@testing-library/react';
import App from './App';
import chrome from 'sinon-chrome/extensions'


let agentGetter;

beforeAll(function () {
  global.chrome = chrome;
});

beforeEach(() => {
  agentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
});

test('should render the application properly', () => {
  const userAgentString = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36';
  agentGetter.mockReturnValue(userAgentString);
  render(<App/>);
  const element = screen.getByText(/Add Item/i);
  expect(element).toBeInTheDocument();
});

test('should show an error message if Chrome version is not adequate', () => {
  const userAgentString = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4389.114 Safari/537.36';
  agentGetter.mockReturnValue(userAgentString);
  render(<App/>);
  const element = screen.getByText(/Requires at least Chrome version 89 to function properly/i);
  expect(element).toBeInTheDocument();
});
