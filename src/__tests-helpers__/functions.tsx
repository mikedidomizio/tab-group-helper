import {ReactWrapper} from 'enzyme';

export const getButtonByText = (wrapper: ReactWrapper, btnText: string) => wrapper.findWhere(node => {
    return (
        node.type() === 'button' &&
        node.text() === btnText
    );
});
