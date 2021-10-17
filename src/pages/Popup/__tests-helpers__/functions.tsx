import { render, screen } from '@testing-library/react';
import { ReactWrapper } from 'enzyme';
import { ReactElement } from 'react';

export const getButtonByText = (wrapper: ReactWrapper, btnText: string) =>
  wrapper.findWhere((node) => {
    return node.type() === 'button' && node.text() === btnText;
  });

export const renderComponentAndExpect = (
  component: ReactElement,
  expectString: RegExp
) => {
  render(component);
  const element = screen.getByText(expectString);
  expect(element).toBeInTheDocument();
};
