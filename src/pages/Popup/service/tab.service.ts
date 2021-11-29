/// <reference types="@types/chrome" />
import { ChromeTabsAttributes } from './lineItems.service';

export class TabService {
  async listAllTabs(
    { currentWindow } = {
      currentWindow: false,
    }
  ): Promise<chrome.tabs.Tab[]> {
    return chrome.tabs.query({
      currentWindow,
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
    try {
      return chrome.tabGroups.update(groupId, {
        color,
        title: newTitle,
      });
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
        return ([] as unknown) as chrome.tabGroups.TabGroup;
      }
      throw e;
    }
  }

  /**
   * Sorts groups for now by title alphabetically
   */
  async sortGroups(): Promise<chrome.tabGroups.TabGroup[]> {
    // todo should also consider that it'll only run/sort or whatever action on that exact window and not all windows
    const groups: chrome.tabGroups.TabGroup[] = await chrome.tabGroups.query(
      {}
    );
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
    return groups;
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
    return chrome.tabs.group({
      groupId,
      tabIds,
      createProperties,
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
    const queryParams: chrome.tabGroups.QueryInfo = {
      title,
    };

    if (withinCurrentWindow) {
      queryParams.windowId = TabService.getCurrentWindow();
    }

    const groups: chrome.tabGroups.TabGroup[] = await chrome.tabGroups.query(
      queryParams
    );
    const group: chrome.tabGroups.TabGroup | undefined = groups.find(
      (group) => group.title === title
    );

    if (group) {
      return group.id;
    }
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
    const allTabs: chrome.tabs.Tab[] = await this.listAllTabs({
      currentWindow: true,
    });
    const allTabsIds: number[] = allTabs.map((i) => i.id || -1);

    return chrome.tabs.ungroup(allTabsIds);
  }

  private static getCurrentWindow(): number {
    return chrome.windows.WINDOW_ID_CURRENT;
  }
}
