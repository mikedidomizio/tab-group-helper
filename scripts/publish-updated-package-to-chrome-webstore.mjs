import chromeWebstoreUpload from 'chrome-webstore-upload';
import {checkNewSemVerIsGreater} from './check-new-sem-ver.mjs';
import fs from 'fs';
import { getZipPath, zipBuild } from './zip-build.mjs';
import path from 'path';

const {GCP_CLIENT_ID, GCP_REFRESH_TOKEN, PUBLISH_EXT} = process.env;
if (PUBLISH_EXT) {
  console.warn('PUBLISH_EXT variable is set, will publish to Chrome Webstore');
} else {
  console.log('PUBLISH_EXT variable is not set, will not publish');
}

const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), './src/manifest.json')).toString());

const chromeWebStore = chromeWebstoreUpload({
  extensionId: 'llhkcebnebfiaamifhbpehjompplpnae',
  clientId: GCP_CLIENT_ID,
  refreshToken: GCP_REFRESH_TOKEN,
});

const token = await chromeWebStore.fetchToken();
const projection = 'DRAFT'; // optional. Can also be 'PUBLISHED' but only "DRAFT" is supported at this time.

const packageInfo = await chromeWebStore.get(projection, token);

const {crxVersion: currentPackageVersion} = packageInfo;

if (checkNewSemVerIsGreater(currentPackageVersion, manifest.version)) {
  // proceed to upload to the chrome web store
  console.log('New version is: ', manifest.version);

  // zip it
  await zipBuild();

  // upload it
  const rr = fs.createReadStream(getZipPath);
  rr.on('open', async() => await chromeWebStore.uploadExisting(rr, token));
  rr.on('end', async() => {
    console.log('Uploaded extension');

    if (PUBLISH_EXT) {
      await chromeWebStore.publish('default', token).then(res => {
        console.log('Published!');
      });
    } else {
      console.log('Done, did not publish as env var not set')
    }
  });
} else {
  throw new Error(`Error with new version, crx version: ${currentPackageVersion}, new version: ${manifest.version}`);
}