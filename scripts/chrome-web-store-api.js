import chromeWebstoreUpload from 'chrome-webstore-upload';

const { GCP_CLIENT_ID, GCP_REFRESH_TOKEN } = process.env;
const chromeWebStore = chromeWebstoreUpload({
  extensionId: 'llhkcebnebfiaamifhbpehjompplpnae',
  clientId: GCP_CLIENT_ID,
  refreshToken: GCP_REFRESH_TOKEN,
});

export { chromeWebStore };
