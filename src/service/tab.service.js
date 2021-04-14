export class TabService {

    /**
     * @return {Promise<unknown>}
     */
    async listAllTabs() {
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
     * @param {boolean} regex
     * @return {Promise<array>}
     */
    async getTabsWhichMatch(text, type, regex = false) {
        const tabs = await this.listAllTabs();
        const cleanedText = text.trim();
        if (cleanedText.length) {
            if (regex) {
                return tabs.filter(i => i[type].match(new RegExp(cleanedText)));
            }
            return tabs.filter(i => i[type].includes(cleanedText));
        }
        // if text length is empty, we return nothing
        return [];
    }

    /**
     *
     * @param {number[]} tabIds
     * @param {string} groupName
     * @param {string} color
     * @return {Promise<unknown>}
     */
    async addTabsToGroup(tabIds, groupName, color = null) {
        // does this work?  existingGroupId for both existing non-existing?
        const existingGroupId = await this.getGroupIdByTitle(groupName);
        const groupId = await this.createGroup(existingGroupId, tabIds);
        return this.renameGroupById(groupId, groupName, color);
    }

    /**
     * @param {number} groupId
     * @param {string} newTitle
     * @param {"grey" | "blue" | "red" | "yellow" | "green" | "pink" | "purple" | "cyan" | null} color
     * @return {Promise<unknown>}
     */
    async renameGroupById(groupId, newTitle, color = null) {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabGroups.update(groupId, {
                    color,
                    title: newTitle,
                }, tabGroup => resolve(tabGroup));
            } catch (e) {
                reject(e)
            }
        });
    }

    /**
     * @param {number | null} groupId
     * @param {number[]} tabIds
     * @param {object} createProperties
     * @return {Promise<number>}    returns the groupId
     */
    async createGroup(groupId = null, tabIds, createProperties = null) {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.group({
                    groupId,
                    tabIds,
                    createProperties,
                }, groupId => resolve(groupId))
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
    async getGroupIdByTitle(title) {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabGroups.query({
                    title,
                }, groupIds => {
                    if (groupIds.length >= 1) {
                        resolve(groupIds[0].id)
                    }
                    resolve(null);
                })
            } catch (e) {
                reject(e)
            }
        });
    }

    /**
     * Clear all groups
     */
    async clearGroups() {
        // https://developer.chrome.com/docs/extensions/reference/tabs/#method-ungroup
        const allTabs = await this.listAllTabs();
        const allTabsIds = allTabs.map(i => i.id);
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.ungroup(allTabsIds, resolve);
            } catch(e) {
                reject(e);
            }
        });

    }
}
