// workaround since enzyme hasn't released for React 17.  So we use this person's workaround
// https://github.com/enzymejs/enzyme/issues/2429#issuecomment-679265564
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme from 'enzyme';

Enzyme.configure({ adapter: new Adapter() });
