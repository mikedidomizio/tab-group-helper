import {render, screen} from '@testing-library/react';
import App from './App';
import chrome from 'sinon-chrome/extensions'
import {mount} from 'enzyme';
import packageJSON from '../package.json';
import './__tests-helpers__/enzyme-adapter';

let agentGetter;

beforeAll(function () {
    global.chrome = chrome;
});

let defaultUserAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36';

beforeEach(() => {
    agentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
    agentGetter.mockReturnValue(defaultUserAgent);
});

test('should render the application properly', () => {
    render(<App/>);
    const element = screen.getByText(/Add Item/i);
    expect(element).toBeInTheDocument();
});

test('should show an error message if Chrome version is not adequate', () => {
    let newUserAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4389.114 Safari/537.36';
    agentGetter.mockReturnValue(newUserAgent);
    render(<App/>);
    const element = screen.getByText(/Requires at least Chrome version 89 to function properly/i);
    expect(element).toBeInTheDocument();
});

test('should include a link that opens a new tab to the github repo', () => {
    const wrapper = mount(<App/>);
    wrapper.find('button[aria-label="github"]').simulate('click');
    expect(chrome.tabs.create.withArgs({url: packageJSON.repository.url})).toBeTruthy();
});
