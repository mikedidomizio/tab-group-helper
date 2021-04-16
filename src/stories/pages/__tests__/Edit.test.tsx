import {render, screen} from '@testing-library/react';
import {Edit} from '../Edit';
import React from "react";
import Enzyme, {mount, ReactWrapper} from 'enzyme';
// workaround since enzyme hasn't released for React 17.  So we use this person's workaround
// https://github.com/enzymejs/enzyme/issues/2429#issuecomment-679265564
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

beforeAll(() => {
    // mock localStorage // todo this is possibly removable
    (global.localStorage as any) = {
        getItem: [],
        setItem: jest.fn(), // not used
        clear: jest.fn() // not used
    };
});

afterEach(() => {
    jest.clearAllMocks();
});

Enzyme.configure({adapter: new Adapter()});

test('should render the component properly', () => {
    render(<Edit/>);
    const element = screen.getByText(/Manually edit/i);
    expect(element).toBeInTheDocument();
});

let wrapper: ReactWrapper;
let getTextArea: () => ReactWrapper<any, any>;

beforeEach(() => {
    wrapper = mount(<Edit/>);
    getTextArea = () => wrapper.find('textarea').findWhere(node => node.find('textarea').get(0).props.value !== undefined);
});

test('should show valid JSON objects for for each line item', () => {
    expect(JSON.parse(getTextArea().props().value).length).toBe(1);
    wrapper.unmount();
});

test('beautify button should clean up the JSON', () => {
    // badly misaligned JSON
    const val = '[ { "id":    776575 }      ]';
    getTextArea().simulate('change', {target: {value: val}});
    const button = wrapper.findWhere(node => {
        return (
            node.type() === 'button' &&
            node.text() === 'Beautify'
        );
    });
    button.simulate('click');
    const cleanedUpVal = JSON.stringify(JSON.parse(val), undefined, 4);
    expect(getTextArea().props().value).toEqual(cleanedUpVal);
    wrapper.unmount();
});

test('should show error if matching ids exist', () => {
    const val = '[ { "id": 123 }, { "id": 123 } ]';
    getTextArea().simulate('change', {target: {value: val}});
    expect(wrapper.html()).toContain('Cannot have duplicate IDs');
    wrapper.unmount()
});

test('should show error JSON text is invalid', () => {
    const val = '[ { "id": 123 }, /// ]';
    getTextArea().simulate('change', {target: {value: val}});
    expect(wrapper.html()).toContain('Issue with JSON');
    wrapper.unmount()
});

test('reset button should return/beautify JSON into the previously saved value (state)', () => {
    const savedStateValue = getTextArea().props().value;
    const val = '[ { "id": 123 }, /// ]';
    getTextArea().simulate('change', {target: {value: val}});
    // check that it is indeed invalid
    expect(getTextArea().props().value).toEqual(val);
    // proceed to reset it
    const button = wrapper.findWhere(node => {
        return (
            node.type() === 'button' &&
            node.text().includes('Reset')
        );
    });
    button.simulate('click');
    expect(getTextArea().props().value).toEqual(savedStateValue);
    wrapper.unmount();
});
