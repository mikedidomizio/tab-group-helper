import { newLineItem } from '../../service/lineItems.service';
import { LineItem } from '../LineItem';
import { Board } from './Board';
import React from 'react';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';

global.chrome = chrome;
chrome.tabs.query.yields([]);
chrome.tabs.ungroup = () => {};

export default {
  title: 'pages/Board',
  component: Board,
  subcomponents: { LineItem },
  parameters: {
    viewport: {
      defaultViewport: 'chromeExtension',
    },
  },
};

const Template = (args: any) => <Board {...args} />;

export const Default = Template.bind({});
(Default as any).args = {
  lineItems: [newLineItem()],
};
