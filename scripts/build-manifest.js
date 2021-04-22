const packageJSON = require('../package.json');
const baseManifest = require('./base-manifest.json');
const fs = require('fs');

const {prettyName: name, version, description} = packageJSON;

/**
 * Generates the manifest used for the Chrome store by using variables in the package file
 */
(async () => {
    baseManifest.version = version;
    baseManifest.name = name;
    baseManifest.description = description;

    // use writeFile and not writeFileSync as this will create the file as well
    fs.writeFile('./public/manifest.json', JSON.stringify(baseManifest, undefined, 2), () => {
    });
})();
