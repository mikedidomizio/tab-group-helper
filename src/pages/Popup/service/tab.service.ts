/// <reference types="@types/chrome" />
import { ChromeTabsAttributes } from './lineItems.service';

// https://developer.chrome.com/docs/extensions/reference/tabGroups
// this can also be used for querying I believe
interface ChromeTabGroup {
  collapsed: boolean;
  color: chrome.tabGroups.ColorEnum;
  id: number;
  title?: string;
  windowId: number;
}

// todo with the change from V2 to V3 Manifest, I believe we can convert these chrome API requests to Promises

export class TabService {
  async listAllTabs(
    { currentWindow } = {
      currentWindow: false,
    }
  ): Promise<chrome.tabs.Tab[]> {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.query(
          {
            currentWindow,
          },
          (tabs) => resolve(tabs)
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  async listGroups(
    queryInfo: chrome.tabGroups.QueryInfo = {}
  ): Promise<chrome.tabGroups.TabGroup[]> {
    return chrome.tabGroups.query(queryInfo);
  }

  /**
   * @param {string} text
   * @param {"url" | "title"} type
   * @param {boolean} caseSensitive
   * @param {boolean} regex
   * @param {boolean} currentWindow whether to match all tabs of all windows (within that Chrome profile)
   */
  async getTabsWhichMatch(
    text: string,
    type: ChromeTabsAttributes,
    caseSensitive = false,
    regex = false,
    currentWindow = false
  ): Promise<chrome.tabs.Tab[]> {
    const tabs = await this.listAllTabs({
      currentWindow,
    });
    let cleanedText = text.trim();
    cleanedText = caseSensitive ? cleanedText : cleanedText.toLowerCase();

    if (cleanedText.length) {
      if (regex) {
        return tabs.filter((i: chrome.tabs.Tab) => {
          // @ts-ignore
          if (i[type]) {
            if (caseSensitive) {
              // @ts-ignore
              return i[type].match(new RegExp(cleanedText));
            } else {
              // @ts-ignore
              return i[type].match(new RegExp(cleanedText, 'i'));
            }
          }

          return false;
        });
      }

      return tabs.filter((i) => {
        if (i && i[type]) {
          // @ts-ignore
          const val = caseSensitive ? i[type] : i[type].toLowerCase();
          return (val as ChromeTabsAttributes).includes(cleanedText);
        }
        return false;
      });
    }
    // if text length is empty, we return nothing
    return [];
  }

  /**
   *
   * @param {number[]} tabIds
   * @param {string} groupName
   * @param {string} color
   */
  async addTabsToGroup(
    tabIds: number[],
    groupName: string,
    color?: chrome.tabGroups.ColorEnum
  ): Promise<chrome.tabGroups.TabGroup> {
    // does this work?  existingGroupId for both existing non-existing?
    const existingGroupId = await this.getGroupIdByTitle(groupName, true);
    const groupId = await this.createGroup(existingGroupId, tabIds);
    return this.renameGroupById(groupId, groupName, color);
  }

  async renameGroupById(
    groupId: number,
    newTitle: string,
    color?: chrome.tabGroups.ColorEnum
  ): Promise<chrome.tabGroups.TabGroup> {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabGroups.update(
          groupId,
          {
            color,
            title: newTitle,
          },
          resolve
        );
      } catch (e) {
        // an error can be thrown if color is `undefined`, but it's acceptable
        // here we check if the message contains that and if so, we don't reject so we don't see
        // an error thrown
        if (
          (e as any).message.includes("property 'color': Value must be one of")
        ) {
          // todo perhaps it should grab a list of groups and return it instead of an empty array
          console.warn(
            'Error thrown due to color not being set, empty results returned'
          );
          resolve(([] as unknown) as chrome.tabGroups.TabGroup);
        }
        reject(e);
      }
    });
  }

  /**
   * Sorts groups for now by title alphabetically
   */
  async sortGroups(): Promise<ChromeTabGroup[]> {
    return new Promise((resolve, reject) => {
      try {
        // todo should also consider that it'll only run/sort or whatever action on that exact window and not all windows
        chrome.tabGroups.query({}, (groups: ChromeTabGroup[]) => {
          groups.sort((a, b) => {
            if (a.title && b.title) {
              if (a.title > b.title) {
                return 1;
              }
              if (a.title < b.title) {
                return -1;
              }
            }

            return 0;
          });

          // if index starts at -1, it'll be at the end
          for (let i = 0; i < groups.length; i++) {
            chrome.tabGroups.move(groups[i].id, {
              index: i,
            });
          }
          resolve(groups);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * @param {number} groupId
   * @param {number[]} tabIds
   * @param {object} createProperties
   * @return {Promise<number>}    returns the groupId
   */
  async createGroup(
    groupId: number | undefined,
    tabIds: number[] = [],
    createProperties: { windowId?: number } | undefined = undefined
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.group(
          {
            groupId,
            tabIds,
            createProperties,
          },
          resolve
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Multiple value can be returned because you can have multiple groups of the same title/color
   * Returns empty array if group does not exist
   * We're going to return the first one but we're really hoping the user has one group by name
   * @param {string} title
   * @param {boolean} withinCurrentWindow
   * @return {Promise<number | null>}
   */
  async getGroupIdByTitle(
    title: string,
    withinCurrentWindow = false
  ): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
      const queryParams: chrome.tabGroups.QueryInfo = {
        title,
      };

      if (withinCurrentWindow) {
        queryParams.windowId = TabService.getCurrentWindow();
      }

      try {
        chrome.tabGroups.query(queryParams, (groups: ChromeTabGroup[]) => {
          const group: ChromeTabGroup | undefined = groups.find(
            (group) => group.title === title
          );

          if (group) {
            resolve(group.id);
          }
          resolve(undefined);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Collapses all groups, either all groups or specific ones
   */
  async collapseGroups(
    ifCollapsedExpandAll = false
  ): Promise<chrome.tabGroups.TabGroup[]> {
    let actionIsCollapse = true;

    const groupsOfCurrentWindow = await this.listGroups({
      windowId: TabService.getCurrentWindow(),
    });

    if (ifCollapsedExpandAll) {
      const uniqueCollapsedValues = groupsOfCurrentWindow
        .map((group) => group.collapsed)
        .filter((x, i, a) => a.indexOf(x) === i);
      if (uniqueCollapsedValues.length !== 2) {
        actionIsCollapse = !uniqueCollapsedValues[0];
      }
    }

    const promises = groupsOfCurrentWindow.map((group) =>
      chrome.tabGroups.update(group.id, {
        collapsed: actionIsCollapse,
      })
    );

    return Promise.all(promises);
  }

  /**
   * Clear all groups
   */
  async clearGroups(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const allTabs = await this.listAllTabs({
          currentWindow: true,
        });
        const allTabsIds = allTabs.map((i) => i.id);
        // @ts-ignore
        chrome.tabs.ungroup(allTabsIds, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  private static getCurrentWindow(): number {
    return chrome.windows.WINDOW_ID_CURRENT;
  }
}
