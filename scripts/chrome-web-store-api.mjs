import chromeWebstoreUpload from 'chrome-webstore-upload';

const { GCP_CLIENT_ID, GCP_CLIENT_SECRET, GCP_REFRESH_TOKEN } = process.env;

if (!GCP_CLIENT_ID) {
  throw new Error('No GCP_CLIENT_ID')
}

if (!GCP_CLIENT_SECRET) {
  throw new Error('No GCP_CLIENT_SECRET')
}

if (!GCP_REFRESH_TOKEN) {
  throw new Error('No GCP_REFRESH_TOKEN')
}

const chromeWebStore = chromeWebstoreUpload({
  extensionId: 'llhkcebnebfiaamifhbpehjompplpnae',
  clientId: GCP_CLIENT_ID,
  clientSecret: GCP_CLIENT_SECRET,
  refreshToken: GCP_REFRESH_TOKEN,
});

export { chromeWebStore };
