import { BottomBarButton } from './BottomBarButton';
import React from 'react';

export default {
  title: 'components/BottomBarButton',
  component: BottomBarButton,
};

const Template = (args: any) => <BottomBarButton {...args} />;

export const NoTooltip = Template.bind({});
(NoTooltip as any).args = {
  children: 'No tooltip',
};

export const Tooltip = Template.bind({});
(Tooltip as any).args = {
  children: 'I have a tooltip',
  tooltip: 'This is an example tooltip!',
};

export const ButtonClicked = Template.bind({});
(ButtonClicked as any).args = {
  children: 'Click me produces an alert',
  onClick: () => alert('button clicked'),
};
