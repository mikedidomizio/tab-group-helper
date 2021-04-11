import React from 'react';

import {LineItem} from './LineItem';

export default {
    title: 'Line Item',
    component: LineItem,
};

const Template = (args) => <LineItem {...args} />;

export const Main = Template.bind({});
Main.args = {
    applyChanges: false,
    existing: false,
    deleteLineItem: () => console.log('mocking deletion of line item'),
    onLineItemChange: () => console.log('mocking line item change'),
    text: ""
};
