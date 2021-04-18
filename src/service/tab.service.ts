/// <reference types="@types/chrome" />

import {ChromeTabsAttributes} from './lineItems.service';

export class TabService {

    /**
     * @return {Promise<Tab[]>}
     */
    async listAllTabs(): Promise<chrome.tabs.Tab[]> {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.query(/*queryOptions*/ {}, tabs => resolve(tabs));
            } catch (e) {
                reject(e)
            }
        });
    }

    /**
     * @param {string} text
     * @param {"url" | "title"} type
     * @param {boolean} caseSensitive
     * @param {boolean} regex
     * @return {Promise<Tab[]>}
     */
    async getTabsWhichMatch(text: string, type: ChromeTabsAttributes, caseSensitive = false, regex = false): Promise<chrome.tabs.Tab[]> {
        const tabs = await this.listAllTabs();
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

            return tabs.filter(i => {
                // @ts-ignore
                const val = caseSensitive ? i[type] : i[type].toLowerCase();
                return (val as ChromeTabsAttributes).includes(cleanedText);
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
     * @return {Promise<TabGroup>}
     */
    async addTabsToGroup(tabIds: number[], groupName: string, color?: chrome.tabGroups.ColorEnum): Promise<chrome.tabGroups.TabGroup> {
        // does this work?  existingGroupId for both existing non-existing?
        const existingGroupId = await this.getGroupIdByTitle(groupName);
        const groupId = await this.createGroup(existingGroupId, tabIds);
        return this.renameGroupById(groupId, groupName, color);
    }

    async renameGroupById(groupId: number, newTitle: string, color?: chrome.tabGroups.ColorEnum): Promise<chrome.tabGroups.TabGroup> {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabGroups.update(groupId, {
                    color,
                    title: newTitle,
                }, resolve);
            } catch (e) {
                // an error can be thrown if color is `undefined`, but it's acceptable
                // here we check if the message contains that and if so, we don't reject so we don't see
                // an error thrown
                if (e.message.includes('property \'color\': Value must be one of')) {
                    // todo perhaps it should grab a list of groups and return it instead of an empty array
                    console.warn('Error thrown due to color not being set, empty results returned');
                    resolve([] as unknown as chrome.tabGroups.TabGroup);
                }
                reject(e)
            }
        });
    }

    /**
     * @param {number} groupId
     * @param {number[]} tabIds
     * @param {object} createProperties
     * @return {Promise<number>}    returns the groupId
     */
    async createGroup(groupId: number | undefined, tabIds: number[] = [], createProperties: { windowId?: number } | undefined = undefined): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.group({
                    groupId,
                    tabIds,
                    createProperties,
                }, resolve);
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
     * @return {Promise<number | null>}
     */
    async getGroupIdByTitle(title: string): Promise<number | undefined> {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabGroups.query({
                    title,
                }, groupIds => {
                    if (groupIds.length >= 1) {
                        resolve(groupIds[0].id)
                    }
                    resolve(undefined);
                })
            } catch (e) {
                reject(e)
            }
        });
    }

    /**
     * Clear all groups
     */
    async clearGroups(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const allTabs = await this.listAllTabs();
                const allTabsIds = allTabs.map(i => i.id);
                // @ts-ignore
                chrome.tabs.ungroup(allTabsIds, resolve);
            } catch (e) {
                reject(e);
            }
        });

    }
}
