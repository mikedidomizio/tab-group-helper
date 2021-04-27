import {MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';

const customViewports = {
    chromeExtension: {
        name: 'Chrome Extension',
        styles: {
            width: '650px',
            height: '600px',
        },
    },
}


export const parameters = {
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
    viewport: {
        // defaultViewport: 'chromeExtension',
        viewports: {
            ...MINIMAL_VIEWPORTS,
            ...customViewports,
        },
    }
}
