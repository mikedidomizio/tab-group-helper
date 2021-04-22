# Tab Group Helper

[<img src="https://github.com/mikedidomizio/tab-group-helper/actions/workflows/main.yml/badge.svg" alt="Build Status">](https://github.com/mikedidomizio/tab-group-helper/actions/workflows/main.yml)
[![codecov](https://codecov.io/gh/mikedidomizio/tab-group-helper/branch/master/graph/badge.svg?token=RNZY19LBKL)](https://codecov.io/gh/mikedidomizio/tab-group-helper)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/839bbee00ab645b384a4e387bd40c5b0)](https://www.codacy.com/gh/mikedidomizio/tab-group-helper/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mikedidomizio/tab-group-helper&amp;utm_campaign=Badge_Grade)

This extension allows the user to run a set of commands which will automatically group tabs by title or URL.
Including the ability to use regular expressions for more advanced capturing.

Ex.
For instance if you have a number of "GitHub" and "GitLab" tabs open and want to group them under "Git", you could

## Development

This is written in React and uses Storybook for component isolation development.  Components are deployed to GitHub pages
and can be viewed [here](https://mikedidomizio.github.io/tab-group-helper)

To get started with development, run `yarn install` to get the dependencies.

### Hot Reloading extension

`yarn watch`

Will build the extension, load the `./build` directory as an unpacked extension.  This will hot reload changes.

### Building the extension

`yarn build-ext` will build the extension into the `./dist` directory with the manifest.  Loading the directory as an unpacked extension into Chrome.
