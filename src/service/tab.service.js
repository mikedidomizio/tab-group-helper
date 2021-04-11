export class TabService {

    /**
     * @return {Promise<unknown>}
     */
    async listAllTabs() {
        return new Promise((resolve, /*reject*/) => {
            try {
                chrome.tabs.query(/*queryOptions*/ {}, tabs => resolve(tabs));
            } catch(e){
                // todo error handling
            }
        });
    }

    /**
     * @param {string} text
     * @param {"url" | "title"} type
     * @param {boolean} regex
     * @return {Promise<*>}
     */
    async getTabsWhichMatch(text, type, regex = false) {
        const tabs = await this.listAllTabs();
        if (regex) {
            return tabs.filter(i => i[type].match(new RegExp(text)));
        }
        return tabs.filter(i => i[type].includes(text));
    }

    /**
     *
     * @param {number[]} tabIds
     * @param {string} groupName
     * @param {string} color
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
            try {
                chrome.tabGroups.update(groupId, {
                    color,
                    title: newTitle,
                }, tabGroup => resolve(tabGroup));
            } catch(e) {
                // todo error handling
            }
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
            try {
                chrome.tabs.group({
                    groupId,
                    tabIds,
                    createProperties,
                }, groupId => resolve(groupId))
            } catch(e) {
                // todo error handling
            }
        });
    }

}
