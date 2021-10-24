import { chrome, generateFakeTab } from '../../__tests-helpers__/functions';
import { ChromeTabsAttributes } from '../lineItems.service';
import { TabService } from '../tab.service';

jest.setTimeout(30000);

beforeAll(function () {
  global.chrome = chrome;
});

interface ChromeError extends Error {}

describe('tab service', () => {
  let tabsService: TabService;

  beforeAll(() => {
    tabsService = new TabService();
  });

  describe('addTabsToGroup', () => {
    it('should not throw an error if no color is specified', async () => {
      // prevents jest from spitting out an unnecessary console warning
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      chrome.tabGroups = {
        update: () => {
          throw new Error("property 'color': Value must be one of");
        },
        query: (t: string, callback: Function) =>
          callback([{ id: 123 }, { id: 234 }]),
      };
      chrome.tabs.group = (t: string, callback: Function) =>
        callback([{ id: 123 }, { id: 234 }]);

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
        },
      };
      try {
        await tabsService.listAllTabs();
      } catch (e: any) {
        expect(e.message).toBe('bad');
      }

      // reset so the next tests don't fail
      chrome.tabs = tmpChrome;
    });
  });

  describe('clearGroups', () => {
    it('should throw if chrome API ungroup fails', async () => {
      chrome.tabs.query.yields([{ id: 123 }]);
      chrome.tabs.ungroup = () => {
        throw new Error('bad');
      };
      try {
        await tabsService.clearGroups();
      } catch (e: any) {
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
      } catch (e: any) {
        expect(e.message).toBe('bad');
      }
    });
  });

  describe('getGroupIdByTitle', () => {
    it('will return the first group if multiple groups are matched', async () => {
      chrome.tabGroups = {
        query: (t: string, callback: Function) =>
          callback([{ id: 123 }, { id: 234 }]),
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
      } catch (e: any) {
        expect(e.message).toBe('bad');
      }
    });
  });

  describe('getTabsWhichMatch', () => {
    beforeAll(() => {
      chrome.tabs.query.yields([
        generateFakeTab({ title: 'react - good times', url: 'react.com' }),
        generateFakeTab({ title: 'facebook', url: 'facebook.com' }),
      ]);
    });

    describe('success path', () => {
      const checkAndExpect = async (
        text: string,
        type: ChromeTabsAttributes,
        caseSensitive: boolean,
        regex: boolean,
        num: number
      ) =>
        expect(
          (
            await tabsService.getTabsWhichMatch(
              text,
              type,
              caseSensitive,
              regex
            )
          ).length
        ).toBe(num);

      it('should be case sensitive if case sensitive is set and have strict matching', async () => {
        await checkAndExpect(
          'React',
          ChromeTabsAttributes.title,
          true,
          false,
          0
        );
      });

      it('should return an empty array if the text sent is zero length', async () => {
        await checkAndExpect('', ChromeTabsAttributes.title, false, false, 0);
      });

      it('should return an empty array if text is empty and type is of regex', async () => {
        await checkAndExpect('', ChromeTabsAttributes.title, false, true, 0);
      });

      it('should return an empty array if text when trimmed is empty, preventing accidental grouping unnecessarily', async () => {
        await checkAndExpect(' ', ChromeTabsAttributes.title, false, false, 0);
      });

      it('should match titles which contain text', async () => {
        await checkAndExpect(
          'react',
          ChromeTabsAttributes.title,
          false,
          false,
          1
        );
      });

      it('should match url which contain text', async () => {
        await checkAndExpect(
          'react.co',
          ChromeTabsAttributes.url,
          false,
          false,
          1
        );
      });

      it('should regex match url which contain text', async () => {
        await checkAndExpect(
          'Reac|Face',
          ChromeTabsAttributes.url,
          false,
          true,
          2
        );
      });

      it('should regex match title which contain text', async () => {
        await checkAndExpect(
          'reac|Face',
          ChromeTabsAttributes.title,
          false,
          true,
          2
        );
      });

      it('should regex match url which contain text and return empty if case sensitive is set', async () => {
        await checkAndExpect(
          'reac|Face',
          ChromeTabsAttributes.url,
          true,
          true,
          1
        );
      });

      it('should allow more complex regular expressions', async () => {
        // title
        await checkAndExpect(
          '^(reac|face)',
          ChromeTabsAttributes.title,
          false,
          true,
          2
        );
        await checkAndExpect(
          '^(reac|facetruck)',
          ChromeTabsAttributes.title,
          false,
          true,
          1
        );
        await checkAndExpect(
          '(times|book)$',
          ChromeTabsAttributes.title,
          false,
          true,
          2
        );
        // url
        await checkAndExpect('.com$', ChromeTabsAttributes.url, false, true, 2);
      });
    });

    it("should not match a type that doesn't exist on that tab", async () => {
      await tabsService.getTabsWhichMatch(
        'reac',
        (undefined as unknown) as ChromeTabsAttributes,
        false,
        true
      );
    });
  });
});
