import {
  chrome,
  getButtonByText,
  renderComponentAndExpect,
} from '../../../__tests-helpers__/functions';
import { newLineItem } from '../../../service/lineItems.service';
import { Edit } from '../Edit';
import { act, fireEvent, render, screen, within, RenderResult } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';

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
});

test.skip('should render the component properly', () =>
  renderComponentAndExpect(<Edit />, /Manually Edit/i));

let getTextArea: () => HTMLElement;
let renderResult: RenderResult;

beforeEach(() => {
  renderResult = render(<Edit />);
  // prefer the placeholder to disambiguate MUI's hidden textarea
  getTextArea = () =>
    within(renderResult.container).getByPlaceholderText('JSON value of rules, edit with care');
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
  fireEvent.change(getTextArea(), { target: { value: val } });
  getButtonByText('Beautify').click();
  const cleanedUpVal = JSON.stringify(JSON.parse(val), undefined, 4);
  expect((getTextArea() as HTMLTextAreaElement).value).toEqual(cleanedUpVal);
});

test('beautify button should not clean up the JSON if the JSON is invalid', () => {
  // bad JSON
  const val = '[ { "id": 776575BAD } ]';
  fireEvent.change(getTextArea(), { target: { value: val } });
  // call the helper via text
  userEvent.click(getButtonByText('Beautify'));
  expect((getTextArea() as HTMLTextAreaElement).value).toEqual(val);
});

describe('error testing', () => {
  const simulateAndExpectError = (val: string, error: string) => {
    fireEvent.change(getTextArea(), { target: { value: val } });
    expect(document.body.innerHTML).toContain(error);
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
  const savedStateValue = (getTextArea() as HTMLTextAreaElement).value;
  const val = '[ { "id": 123 }, /// ]';
  fireEvent.change(getTextArea(), { target: { value: val } });
  // check that it is indeed invalid
  expect((getTextArea() as HTMLTextAreaElement).value).toEqual(val);
  // proceed to reset it
  const button = screen.getByRole('button', { name: /Reset/i });
  userEvent.click(button);
  expect((getTextArea() as HTMLTextAreaElement).value).toEqual(savedStateValue);
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
    const { container } = render(<Edit />);

    const textarea = within(container).getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: '[{ "id": 123, "test": "works" }]' },
    });

    const copyButton = within(container).getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    expect(clipboardSpy).toHaveBeenCalledWith(
      '[{ "id": 123, "test": "works" }]'
    );
  });

  test('should change the text of the button and have an icon', () => {
    const { container } = render(<Edit />);

    const copyButton = within(container).getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    const updatedCopyButton = within(container).queryByText(/copied/i);
    const buttonContainer = within(container).getByRole('button', {
      name: /copy the valid json to clipboard/i,
    });

    expect(updatedCopyButton).toBeInTheDocument();
    expect(within(container).queryByText(/copy to clipboard/i)).not.toBeInTheDocument();
    expect(buttonContainer.querySelector('svg')).toBeInTheDocument();
  });

  test('after a few seconds the text for the copy button should return back to the default state', async () => {
    const { container } = render(<Edit />);

    const copyButton = within(container).getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    const buttonContainer = within(container).getByRole('button', {
      name: /copy the valid json to clipboard/i,
    });

    expect(within(container).queryByText(/copied/i)).toBeInTheDocument();
    expect(within(container).queryByText(/copy to clipboard/i)).not.toBeInTheDocument();
    expect(buttonContainer.querySelector('svg')).toBeInTheDocument();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 5000));

      expect(within(container).queryByText(/copied/i)).not.toBeInTheDocument();
      expect(within(container).queryByText(/copy to clipboard/i)).toBeInTheDocument();
      expect(buttonContainer.querySelector('svg')).not.toBeInTheDocument();
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
    const { container } = render(<Edit />);

    const textarea = within(container).getByRole('textbox');
    fireEvent.change(textarea, {
      target: { value: '[{ "id": 123, "test": "works" }]' },
    });

    const copyButton = within(container).getByText(/copy to clipboard/i);
    fireEvent.click(copyButton);

    const errorCopyButton = within(container).queryByText(/error/i);
    const buttonContainer = within(container).getByRole('button', {
      name: /copy the valid json to clipboard/i,
    });

    expect(errorCopyButton).toBeInTheDocument();
    expect(within(container).queryByText(/copy to clipboard/i)).not.toBeInTheDocument();
    expect(buttonContainer.querySelector('svg')).toBeInTheDocument();
  });
});
