import React from 'react';
// @ts-ignore
import chrome from 'sinon-chrome/extensions';

import {Board} from './Board';
import {LineItem} from '../LineItem';
import {newLineItem} from '../../service/lineItems.service';

global.chrome = chrome;
chrome.tabs.query.yields([]);
chrome.tabs.ungroup = () => {}

export default {
    title: 'pages/Board',
    component: Board,
    subcomponents: { LineItem },
};

const Template = (args: any) => <Board {...args} />;

export const Default = Template.bind({});
(Default as any).args = {
    lineItems: [newLineItem()]
};
