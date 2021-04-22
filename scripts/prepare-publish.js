const packageJSON = require('../package.json');
const fs = require('fs');

// runs the build manifest
require('./build-manifest');

/**
 * Check that changelog is updated with what has changed in new version
 */
(async () => {
    const changelog = fs.readFileSync('./CHANGELOG.md');
    const changelogRegex = new RegExp(`## ${packageJSON.version}`);

    if (!changelogRegex.test(changelog.toString())) {
        throw new Error('Changelog has not been updated to include items changed in this version');
    }
})();

