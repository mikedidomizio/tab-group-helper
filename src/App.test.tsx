import {render, screen} from '@testing-library/react';
// import App from './App';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';
import {mount, ReactWrapper} from 'enzyme';
import './__tests-helpers__/enzyme-adapter';
// @ts-ignore
import {createMemoryHistory} from 'history';

// @ts-ignore
let agentGetter: SpyInstance;
let wrapper: ReactWrapper;
let defaultUserAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36';

beforeAll(function () {
    global.chrome = chrome;
});

beforeEach(() => {
    agentGetter = jest.spyOn(window.navigator, 'userAgent', 'get')
    agentGetter.mockReturnValue(defaultUserAgent);
});


jest.mock('history');

let pathFn: jest.Mock;

beforeEach(() => {
    pathFn = jest.fn().mockImplementation(() => {
    });

    createMemoryHistory.mockImplementation(() => {
        return {
            location: {
                pathname: '/',
            },
            push: pathFn,
        }
    });
})

test('should show an error message if Chrome version is not adequate', () => {
    jest.isolateModules(() => {
        const App = require('./App').default;
        let newUserAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4389.114 Safari/537.36';
        agentGetter.mockReturnValue(newUserAgent);
        render(<App/>);
        const element = screen.getByText(/Requires at least Chrome version 89 to function properly/i);
        expect(element).toBeInTheDocument();
    });
});

test('header menu links should update the history which will change the page', () => {
    jest.isolateModules(() => {
        const App = require('./App').default;
        wrapper = mount(<App/>);
        const menuLinkClickAndExpect = (linkName: string, expectedPath: string) => {
            wrapper.find('header button').simulate('click');
            wrapper.findWhere(node => {
                return (
                    node.type() === 'li' &&
                    node.text() === linkName
                );
            }).simulate('click');
            expect(pathFn).toHaveBeenCalledWith(expectedPath);
        };

        menuLinkClickAndExpect('Home', '/');
        menuLinkClickAndExpect('Manually Edit', '/edit');
        menuLinkClickAndExpect('Help', '/help');
        wrapper.unmount();
    });
});
