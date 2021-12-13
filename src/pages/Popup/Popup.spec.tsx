import './__tests-helpers__/enzyme-adapter';
import { chrome } from './__tests-helpers__/functions';
import { mount, ReactWrapper } from 'enzyme';
// @ts-ignore
import { createMemoryHistory } from 'history';

// @ts-ignore
let agentGetter: SpyInstance;
let wrapper: ReactWrapper;

beforeAll(function () {
  // @ts-ignore
  global.chrome = chrome;
});

jest.mock('history');

let pathFn: jest.Mock;

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
    wrapper = mount(<App />);
    const menuLinkClickAndExpect = (linkName: string, expectedPath: string) => {
      wrapper.find('header button').simulate('click');
      wrapper
        .findWhere((node) => {
          return node.type() === 'li' && node.text() === linkName;
        })
        .simulate('click');
      expect(pathFn).toHaveBeenCalledWith(expectedPath);
    };

    menuLinkClickAndExpect('Home', '/');
    menuLinkClickAndExpect('Manually Edit', '/edit');
    menuLinkClickAndExpect('Help', '/help');
    wrapper.unmount();
  });
});
