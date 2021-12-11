# Tab Group Helper

[<img src="https://github.com/mikedidomizio/tab-group-helper/actions/workflows/main.yml/badge.svg" alt="Build Status">](https://github.com/mikedidomizio/tab-group-helper/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/mikedidomizio/tab-group-helper/branch/master/graph/badge.svg?token=RNZY19LBKL)](https://codecov.io/gh/mikedidomizio/tab-group-helper)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/839bbee00ab645b384a4e387bd40c5b0)](https://www.codacy.com/gh/mikedidomizio/tab-group-helper/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mikedidomizio/tab-group-helper&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/c6b0516fddf8d7ac00a2/maintainability)](https://codeclimate.com/github/mikedidomizio/tab-group-helper/maintainability)

This is the source code for a Google Chrome extension that allows the user to set up a bunch of rules to which they can manage groups and tabs by title or URL.

<img src="screenshot.png?3" alt="picture of extension" width="600" />

## Other Features

- Use regular expressions to be more creative/advanced with your grouping rules
- Automatically group tabs on creation and/or on when tabs change web page
- Import/export your settings to share with co-workers or friends
- Sort your groups with a click of a button

## Chrome Web Store

You can download this directly from the Chrome Web Store [here](https://chrome.google.com/webstore/detail/tab-group-helper/llhkcebnebfiaamifhbpehjompplpnae)
or build it directly and load it

## Development

This is written in React and uses a combination of RTL and unit tests to ensure quality.

To get started with development, run `yarn install` to get the dependencies.

### Hot Reloading extension

`yarn start`

Will build the extension, load the `./build` directory as an unpacked extension.  This will hot reload changes.

### Building the extension

`yarn build-ext` will build the extension into the `./dist` directory with the manifest.  Loading the directory as an unpacked extension into Chrome.
