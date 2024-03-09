import chromeWebstoreUpload from 'chrome-webstore-upload';

const { GCP_CLIENT_ID, GCP_CLIENT_SECRET, GCP_REFRESH_TOKEN } = process.env;

const chromeWebStore = chromeWebstoreUpload({
  extensionId: 'llhkcebnebfiaamifhbpehjompplpnae',
  clientId: GCP_CLIENT_ID,
  client_secret: GCP_CLIENT_SECRET,
  refreshToken: GCP_REFRESH_TOKEN,
});

export { chromeWebStore };
