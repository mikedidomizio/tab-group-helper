export class TabService {

    getChrome() {
        // check if have the `tabs` to determine if we're in an extension
        if (!chrome.tabs) {
            console.warn('chrome is undefined!');
            return;
        }
        return chrome;
    }

    /**
     * @return {Promise<unknown>}
     */
    async listAllTabs() {
        return new Promise((resolve, /*reject*/) => {
            this.getChrome().tabs.query(/*queryOptions*/ {}, tabs => resolve(tabs));
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
    async addTabsToGroup(tabIds, groupName, color = null) {
        const groupId = await this.createGroup(null, tabIds);
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
            this.getChrome().tabGroups.update(groupId, {
                color,
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
            this.getChrome().tabs.group({
                groupId,
                tabIds,
                createProperties,
            }, groupId => resolve(groupId))
        });
    }

}
