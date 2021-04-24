import {mount} from 'enzyme';
import packageJSON from '../../../../package.json';
import {Help} from '../Help';
import '../../../__tests-helpers__/enzyme-adapter';
// @ts-ignore
import chrome from 'sinon-chrome/extensions'

beforeAll(function () {
    global.chrome = chrome;
});

test('should include a link to the webstore package', () => {
    const wrapper = mount(<Help/>);
    wrapper.find(`a[href="${packageJSON.repository.url}"]`).simulate('click');
    expect(chrome.tabs.create.withArgs({url: packageJSON.repository.url})).toBeTruthy();
});

test('should include a link that opens a new tab to the github repo', () => {
    const url = 'https://chrome.google.com/webstore/detail/tab-group-helper/llhkcebnebfiaamifhbpehjompplpnae';
    const wrapper = mount(<Help/>);
    wrapper.find(`a[href="${url}"]`).simulate('click');
    expect(chrome.tabs.create.withArgs({url})).toBeTruthy();
});
