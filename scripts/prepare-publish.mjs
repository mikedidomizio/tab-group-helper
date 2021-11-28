import { chromeWebStore } from './chrome-web-store-api.mjs';
import * as fs from 'fs';
import path from 'path';
import { checkNewSemVerIsGreater } from './check-new-sem-ver.js';

const packageJSON = JSON.parse(fs.readFileSync(path.join(process.cwd(), './package.json')).toString())
const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), './src/manifest.json')).toString());

/**
 * Check that manifest/package/changelog versioning all matches
 * Checks the new semver is greater than current one
 */
(async () => {
  const changelog = fs.readFileSync(path.resolve('./CHANGELOG.md'));
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

  console.log(`New version is coming: ${manifest.version}`)
})();
