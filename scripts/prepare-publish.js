const packageJSON = require('../package.json');
const fs = require('fs');
const manifest = require('../src/manifest.json');

/**
 * Check that manifest/package/changelog versioning all matches
 */
(async () => {
  const changelog = fs.readFileSync(__dirname + '/../CHANGELOG.md');
  const changelogRegex = new RegExp(`## ${packageJSON.version}`);

  if (packageJSON.version !== manifest.version) {
    throw new Error('package version does not match manifest version');
  }

  if (!changelogRegex.exec(changelog)) {
    throw new Error('changelog needs version');
  }
})();
