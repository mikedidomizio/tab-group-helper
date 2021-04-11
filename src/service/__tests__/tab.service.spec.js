import chrome from 'sinon-chrome/extensions'
import {TabService} from "../tab.service";

jest.setTimeout(30000);

// will be useful if we ever expand on what attributes we can match
const generateFakeTab = (title, url) => {
    return {
        title,
        url,
    }
};

describe('tab service', () => {

    let tabsService;

    beforeAll(function () {
        global.chrome = chrome;
    });

    beforeAll(() => {
        tabsService = new TabService()
    });

    describe('getTabsWhichMatch', () => {

        beforeAll(() => {
            chrome.tabs.query.yields([generateFakeTab("react - good times", "react.com"), generateFakeTab("facebook", "facebook.com")]);
        });

        const checkAndExpect = async (text, type, regex, num) =>
            expect((await tabsService.getTabsWhichMatch(text, type, regex)).length).toBe(num);

        it('should return an empty array if the text sent is zero length', async () => {
            await checkAndExpect("", "title", false, 0);
        });

        it('should return an empty array if text is empty and type is of regex', async() => {
            await checkAndExpect("", "title", true, 0);
        });

        it('should return an empty array if text when trimmed is empty, preventing accidental grouping unnecessarily', async() => {
            await checkAndExpect(" ", "title", false, 0);
        });

        it('should match titles which contain text', async () => {
            await checkAndExpect("react", "title", false, 1);
        });

        it('should match url which contain text', async () => {
            await checkAndExpect("react.co", "url", false, 1);
        });

        it('should regex match url which contain text', async () => {
            await checkAndExpect("reac|face", "url", true, 2);
        });

        it('should regex match title which contain text', async () => {
            await checkAndExpect("reac|face", "title", true, 2);
        });

        it('should allow more complex regular expressions', async () => {
            // title
            await checkAndExpect("^(reac|face)", "title", true, 2);
            await checkAndExpect("^(reac|facetruck)", "title", true, 1);
            await checkAndExpect("(times|book)$", "title", true, 2);
            // url
            await checkAndExpect(".com$", "url", true, 2);
        });

    });

});
