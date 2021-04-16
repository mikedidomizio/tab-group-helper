# Tab Group Helper

[![codecov](https://codecov.io/gh/mikedidomizio/tab-group-helper/branch/master/graph/badge.svg?token=RNZY19LBKL)](https://codecov.io/gh/mikedidomizio/tab-group-helper)

This extension allows the user to run a set of commands which will automatically group tabs by title or URL.
Including the ability to use regular expressions for more advanced capturing.

Ex.
For instance if you have a number of "GitHub" and "GitLab" tabs open and want to group them under "Git", you could

## Development

This is written in React and uses Storybook for component isolation development

`yarn install && yarn start`

This will launch the extension in your browser.  At this time the global `chrome` requests will throw errors but this 
is good enough for a lot of development.

### Hot Reloading extension

`yarn watch`

Will build the extension, load the `./build` directory as an unpacked extension.  This will hot reload changes.

### Building the extension

`yarn build-ext` will build the extension into the `./dist` directory with the manifest.  Loading the directory as an unpacked extension into Chrome.
  
