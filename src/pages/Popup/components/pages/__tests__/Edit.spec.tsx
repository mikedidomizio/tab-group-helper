import '../../../__tests-helpers__/enzyme-adapter';
import {
  chrome,
  getButtonByText,
  renderComponentAndExpect,
} from '../../../__tests-helpers__/functions';
import { newLineItem } from '../../../service/lineItems.service';
import { Edit } from '../Edit';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

// required for a timeout located within this component
jest.setTimeout(10000);

beforeAll(() => {
  (global as any).chrome = chrome;
  // mock localStorage // todo this is possibly removable
  (global.localStorage as any) = {
    getItem: [],
    setItem: jest.fn(), // not used
    clear: jest.fn(), // not used
  };
});

afterEach(() => {
  jest.clearAllMocks();
  wrapper.unmount();
});

test.skip('should render the component properly', () =>
  renderComponentAndExpect(<Edit />, /Manually Edit/i));

let wrapper: ReactWrapper;
let getTextArea: () => ReactWrapper<any, any>;

beforeEach(() => {
  wrapper = mount(<Edit />);
  getTextArea = () =>
    wrapper
      .find('textarea')
      .findWhere(
        (node) => node.find('textarea').get(0).props.value !== undefined
      );
});

afterEach(() => {
  chrome.reset();
});

test('should show valid JSON objects for each line item', async () => {
  chrome.storage.local.get.yields({ lineItems: [newLineItem()] });
  const { rerender } = render(<Edit />);

  await act(async () => rerender(<Edit />));

  expect(screen.getByDisplayValue(/applyChanges/)).toBeInTheDocument();
});

test.skip('beautify button should clean up the JSON', () => {
  // badly misaligned JSON
  const val = '[ { "id":    776575 }      ]';
  getTextArea().simulate('change', { target: { value: val } });
  getButtonByText(wrapper, 'Beautify').simulate('click');
  const cleanedUpVal = JSON.stringify(JSON.parse(val), undefined, 4);
  expect(getTextArea().props().value).toEqual(cleanedUpVal);
});

test('beautify button should not clean up the JSON if the JSON is invalid', () => {
  // bad JSON
  const val = '[ { "id": 776575BAD } ]';
  getTextArea().simulate('change', { target: { value: val } });
  getButtonByText(wrapper, 'Beautify').simulate('click');
  expect(getTextArea().props().value).toEqual(val);
});

describe('error testing', () => {
  const simulateAndExpectError = (val: string, error: string) => {
    getTextArea().simulate('change', { target: { value: val } });
    expect(wrapper.html()).toContain(error);
  };

  test('should show error if matching ids exist', () =>
    simulateAndExpectError(
      '[ { "id": 123 }, { "id": 123 } ]',
      'Cannot have duplicate IDs'
    ));
  test('should show error JSON text is invalid', () =>
    simulateAndExpectError('[ { "id": 123 }, /// ]', 'Issue with JSON'));
});

test.skip('reset button should return/beautify JSON into the previously saved value (state)', () => {
  const savedStateValue = getTextArea().props().value;
  const val = '[ { "id": 123 }, /// ]';
  getTextArea().simulate('change', { target: { value: val } });
  // check that it is indeed invalid
  expect(getTextArea().props().value).toEqual(val);
  // proceed to reset it
  const button = wrapper.findWhere((node) => {
    return node.type() === 'button' && node.text().includes('Reset');
  });
  button.simulate('click');
  expect(getTextArea().props().value).toEqual(savedStateValue);
});

describe('clicking the copy to clipboard button', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {},
      },
    });
  });

  test('should use the browser copy to clipboard functionality', () => {
    const clipboardSpy = jest.spyOn(navigator.clipboard, 'writeText');
    render(<Edit />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: '[{ "id": 123, "test": "works" }]' },
    });

    const copyButton = screen.getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    expect(clipboardSpy).toHaveBeenCalledWith(
      '[{ "id": 123, "test": "works" }]'
    );
  });

  test('should change the text of the button and have an icon', () => {
    render(<Edit />);

    const copyButton = screen.getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    const updatedCopyButton = screen.queryByText(/copied/i);
    const container = screen.getByRole('button', {
      name: /copy the valid json to clipboard/i,
    });

    expect(updatedCopyButton).toBeInTheDocument();
    expect(screen.queryByText(/copy to clipboard/i)).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  test('after a few seconds the text for the copy button should return back to the default state', async () => {
    render(<Edit />);

    const copyButton = screen.getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    const container = screen.getByRole('button', {
      name: /copy the valid json to clipboard/i,
    });

    expect(screen.queryByText(/copied/i)).toBeInTheDocument();
    expect(screen.queryByText(/copy to clipboard/i)).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 5000));

      expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/copy to clipboard/i)).toBeInTheDocument();
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  test('should show the copy button with error text and an icon if copying fails', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: () => {
          throw new Error('BAD');
        },
      },
    });
    render(<Edit />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: '[{ "id": 123, "test": "works" }]' },
    });

    const copyButton = screen.getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    const errorCopyButton = screen.queryByText(/error/i);
    const container = screen.getByRole('button', {
      name: /copy the valid json to clipboard/i,
    });

    expect(errorCopyButton).toBeInTheDocument();
    expect(screen.queryByText(/copy to clipboard/i)).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
