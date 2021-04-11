import React from 'react';

import {Board, newLineItem} from './Board';

export default {
    title: 'Board',
    component: Board,
};

const Template = (args) => <Board {...args} />;

export const Main = Template.bind({});
Main.args = {
    lineItems: [newLineItem()]
};
