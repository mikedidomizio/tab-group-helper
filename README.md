# Tab Group Helper

This extension allows the user to run a set of commands which will automatically group tabs by title or URL.
Including the ability to use regular expressions for more advanced capturing.

Ex.
For instance if you have a number of "GitHub" and "GitLab" tabs open and want to group them under "Git", you could

## Development

This is written in React and uses Storybook for component isolation development

`yarn install && yarn start`

This will launch the extension in your browser.  At this time the global `chrome` requests will throw errors but this 
is good enough for a lot of development.

### Building the extension

`yarn build-ext` will build the extension into the `./build` directory with the manifest.  Loading the unpacked folder into
Chrome extensions will add it.  Although the extension does not have hot reloading while developing, running the command again
should automatically reload the extension in your browser
  
