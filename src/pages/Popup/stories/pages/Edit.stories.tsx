import { Edit } from './Edit';
import React from 'react';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';

global.chrome = chrome;
chrome.tabs.query.yields([]);

export default {
  title: 'pages/Edit',
  component: Edit,
  parameters: {
    viewport: {
      defaultViewport: 'chromeExtension',
    },
  },
};

const Template = (args: any) => <Edit {...args} />;

export const NoError = Template.bind({});
(NoError as any).args = {
  error: null,
};

export const Error = Template.bind({});
(Error as any).args = {
  error: 'error message is visible',
};
