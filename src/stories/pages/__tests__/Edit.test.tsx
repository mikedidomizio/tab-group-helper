import {Edit} from '../Edit';
import React from 'react';
import {mount, ReactWrapper} from 'enzyme';
import '../../../__tests-helpers__/enzyme-adapter';
import {getButtonByText, renderComponentAndExpect} from '../../../__tests-helpers__/functions';

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
    wrapper.unmount();
});

test('should render the component properly', () => renderComponentAndExpect(<Edit/>, /Manually Edit/i))

let wrapper: ReactWrapper;
let getTextArea: () => ReactWrapper<any, any>;

beforeEach(() => {
    wrapper = mount(<Edit/>);
    getTextArea = () => wrapper.find('textarea').findWhere(node => node.find('textarea').get(0).props.value !== undefined);
});

test('should show valid JSON objects for for each line item', () => {
    expect(JSON.parse(getTextArea().props().value).length).toBe(1);
});

test('beautify button should clean up the JSON', () => {
    // badly misaligned JSON
    const val = '[ { "id":    776575 }      ]';
    getTextArea().simulate('change', {target: {value: val}});
    getButtonByText(wrapper, 'Beautify').simulate('click');
    const cleanedUpVal = JSON.stringify(JSON.parse(val), undefined, 4);
    expect(getTextArea().props().value).toEqual(cleanedUpVal);
});

test('beautify button should not clean up the JSON if the JSON is invalid', () => {
    // bad JSON
    const val = '[ { "id": 776575BAD } ]';
    getTextArea().simulate('change', {target: {value: val}});
    getButtonByText(wrapper, 'Beautify').simulate('click');
    expect(getTextArea().props().value).toEqual(val);
});

describe('error testing', () => {

    const simulateAndExpectError =
        (val: string, error: string) => {
            getTextArea().simulate('change', {target: {value: val}});
            expect(wrapper.html()).toContain(error);
        };

    test('should show error if matching ids exist', () => simulateAndExpectError('[ { "id": 123 }, { "id": 123 } ]', 'Cannot have duplicate IDs'));
    test('should show error JSON text is invalid', () => simulateAndExpectError('[ { "id": 123 }, /// ]', 'Issue with JSON'));
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
});
