const packageJSON = require('../package.json');
const fs = require('fs');
const manifest = require('../src/manifest.json');
const { chromeWebStore } = require('./chrome-web-store-api.mjs');
const { checkNewSemVerIsGreater } = require('./check-new-sem-ver.mjs');

/**
 * Check that manifest/package/changelog versioning all matches
 * Checks the new semver is greater than current one
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

  const token = await chromeWebStore.fetchToken();
  const projection = 'DRAFT'; // optional. Can also be 'PUBLISHED' but only "DRAFT" is supported at this time.

  const packageInfo = await chromeWebStore.get(projection, token);

  const { crxVersion: currentPackageVersion } = packageInfo;

  if (!checkNewSemVerIsGreater(currentPackageVersion, manifest.version)) {
    throw new Error(
      'Cannot merge as new semver is not greater than current one, merging will fail in the publishing stage'
    );
  }
})();
