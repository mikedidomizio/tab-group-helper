// @ts-ignore
import chrome from 'sinon-chrome/extensions';
import {TabService} from '../tab.service';

jest.setTimeout(30000);

// will be useful if we ever expand on what attributes we can match
const generateFakeTab = (title: string, url: string) => {
    return {
        title,
        url,
    }
};

beforeAll(function () {
    global.chrome = chrome;
});

describe('tab service', () => {

    let tabsService: TabService;

    beforeAll(() => {
        tabsService = new TabService()
    });

    describe('addTabsToGroup', () => {

        it('should not throw an error if no color is specified', async() => {
            chrome.tabGroups = {
                update: () => {
                    throw new Error('property \'color\': Value must be one of');
                },
                query: (t: string, callback: Function) => callback([{id: 123}, {id: 234}]),
            };
            chrome.tabs.group = (t: string, callback: Function) => callback([{id: 123}, {id: 234}]);

            const tabGroup = await tabsService.addTabsToGroup([], 'myGroup');
            expect(tabGroup).toBeDefined();
        });

    });

    describe('listAllTabs', () => {

        it('should throw if chrome API query fails', async () => {
            // we have to overwrite the chrome API query to throw, we save it to a var, overwrite it
            // then revert it
            const tmpChrome = Object.assign({}, chrome.tabs);
            chrome.tabs = {
                query: () => {
                    throw new Error('bad');
                }
            };
            try {
                await tabsService.listAllTabs();
            } catch (e) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(e.message).toBe('bad');
            }

            // reset so the next tests don't fail
            chrome.tabs = tmpChrome;
        });

    });

    describe('clearGroups', () => {

        it('should throw if chrome API ungroup fails', async () => {
            chrome.tabs.query.yields([{id: 123,}]);
            chrome.tabs.ungroup = () => {
                throw new Error('bad')
            };
            try {
                await tabsService.clearGroups();
            } catch (e) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(e.message).toBe('bad');
            }
        });

    });

    describe('createGroup', () => {

        it('should throw if chrome API query fails', async () => {
            chrome.tabs.group = () => {
                throw new Error('bad');
            };
            try {
                await tabsService.createGroup(123, []);
            } catch (e) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(e.message).toBe('bad');
            }
        });

    });

    describe('getGroupIdByTitle', () => {

        it('will return the first group if multiple groups are matched', async() => {
            chrome.tabGroups = {
                query: (t: string, callback: Function) => callback([{id: 123}, {id: 234}]),
            };
            const id = await tabsService.getGroupIdByTitle('myTitle');
            expect(id).toBe(123);
        });

        it('should throw if chrome API query fails', async () => {
            chrome.tabGroups = {
                query: () => {
                    throw new Error('bad');
                },
            };
            try {
                await tabsService.getGroupIdByTitle('myTitle');
            } catch (e) {
                // eslint-disable-next-line jest/no-conditional-expect
                expect(e.message).toBe('bad');
            }
        });

    });

    describe('getTabsWhichMatch', () => {

        beforeAll(() => {
            chrome.tabs.query.yields([generateFakeTab('react - good times', 'react.com'), generateFakeTab('facebook', 'facebook.com')]);
        });

        describe('success path', () => {

            const checkAndExpect = async (text: string, type: string, regex: boolean, num: number) =>
                expect((await tabsService.getTabsWhichMatch(text, type, regex)).length).toBe(num);

            it('should return an empty array if the text sent is zero length', async () => {
                await checkAndExpect('', 'title', false, 0);
            });

            it('should return an empty array if text is empty and type is of regex', async () => {
                await checkAndExpect('', 'title', true, 0);
            });

            it('should return an empty array if text when trimmed is empty, preventing accidental grouping unnecessarily', async () => {
                await checkAndExpect(' ', 'title', false, 0);
            });

            it('should match titles which contain text', async () => {
                await checkAndExpect('react', 'title', false, 1);
            });

            it('should match url which contain text', async () => {
                await checkAndExpect('react.co', 'url', false, 1);
            });

            it('should regex match url which contain text', async () => {
                await checkAndExpect('reac|face', 'url', true, 2);
            });

            it('should regex match title which contain text', async () => {
                await checkAndExpect('reac|face', 'title', true, 2);
            });

            it('should allow more complex regular expressions', async () => {
                // title
                await checkAndExpect('^(reac|face)', 'title', true, 2);
                await checkAndExpect('^(reac|facetruck)', 'title', true, 1);
                await checkAndExpect('(times|book)$', 'title', true, 2);
                // url
                await checkAndExpect('.com$', 'url', true, 2);
            });

        });

        it('should not match a type that doesn\'t exist on that tab', async () => {
            await tabsService.getTabsWhichMatch('reac', 'unknown', true);
        });

    });

});
