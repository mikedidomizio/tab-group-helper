/* global chrome */

export class TabService {

    /**
     * @return {Promise<unknown>}
     */
    async listAllTabs() {
        return new Promise((resolve, /*reject*/) => {
            chrome.tabs.query(/*queryOptions*/ {}, tabs => resolve(tabs));
        });
    }

    /**
     * @param {string} url
     * @return {Promise<*>}
     */
    async getTabsWhereUrlContains(url) {
        const tabs = await this.listAllTabs();
        return tabs.filter(i => {
            // title
            // url
            // and other stuff
            return i.url.includes(url);
        });
    }

    /**
     *
     * @param {number[]} tabIds
     * @param {string} groupName
     * @return {Promise<unknown>}
     */
    async addTabsToGroup(tabIds, groupName) {
        const groupId = await this.createGroup(null, tabIds);
        return this.renameGroupById(groupId, groupName);
    }

    /**
     * @param {number} groupId
     * @param {string} newTitle
     * @return {Promise<unknown>}
     */
    async renameGroupById(groupId, newTitle) {
        return new Promise((resolve, reject) => {
            chrome.tabGroups.update(groupId, {
                title: newTitle,
            }, tabGroup => resolve(tabGroup));
        });
    }

    /**
     * @param {number | null} groupId
     * @param {number[]} tabIds
     * @param {object} createProperties
     * @return {Promise<number>}    returns the groupId
     */
    async createGroup(groupId = null, tabIds, createProperties = {}) {
        return new Promise((resolve, /*reject*/) => {
            chrome.tabs.group({
                groupId,
                tabIds,
                createProperties,
            }, groupId => resolve(groupId))
        });
    }

}
