import { chrome } from '../../__tests-helpers__/functions';
import { newLineItem } from '../../service/lineItems.service';
import { LineItem, LineItemProps } from '../LineItem';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let getInputByLabel: (field: string) => HTMLElement;
let setDropdownByLabelValue: (label: string, value: string) => Promise<void>;
let setCheckboxByLabelValue: (label: string, checked: boolean) => void;

beforeAll(function () {
  global.chrome = chrome;
});

let lineItemChangeFn = jest.fn();

const props: LineItemProps = {
  deleteLineItem: () => {},
  moveLineItem: () => {},
  onLineItemChange: lineItemChangeFn,
  ...newLineItem(),
};

beforeEach(() => {
  render(<LineItem {...props} />);

  getInputByLabel = (fieldText: string) =>
    // MUI associates labels with inputs; fallback to display value if necessary
    screen.getByLabelText(new RegExp(fieldText));

  setDropdownByLabelValue = async (label: string, value: string) => {
    const select = screen.getByLabelText(new RegExp(label));
    // open the MUI select menu
    fireEvent.mouseDown(select);
    // click the option in the menu
    const option = await screen.findByText(new RegExp(value, 'i'));
    fireEvent.click(option);
  };

  setCheckboxByLabelValue = (label: string, checked: boolean) => {
    const checkbox = screen.getByLabelText(new RegExp(label));
    if ((checkbox as HTMLInputElement).checked !== checked) {
      fireEvent.click(checkbox);
    }
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

test('changing a line item value should call the parent onLineItemChange', async () => {
  await userEvent.click(screen.getByRole('button', { name: /type/i }));
  await userEvent.click(screen.getByRole('option', { name: /url/i }));

  const containElem = screen.getByTitle(/the tab must contain the following/i);
  await userEvent.type(within(containElem).getByRole('textbox'), 'World');

  setCheckboxByLabelValue('Case Sensitive', true);
  setCheckboxByLabelValue('Regex', true);

  const groupElem = screen.getByTitle(/the name that the group will be given/i);
  await userEvent.type(within(groupElem).getByRole('textbox'), 'Foo');

  await setDropdownByLabelValue('Color', 'red');
  setCheckboxByLabelValue('Apply', true);
  // todo should be checking the expectations of the UI
  expect(lineItemChangeFn).toHaveBeenCalledTimes(11);
});
