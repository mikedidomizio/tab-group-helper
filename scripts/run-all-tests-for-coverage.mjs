import { execSync } from 'child_process';

// the CI environment, even when reading the coverage-puppeteer file/folder it won't show up in codecov
// tried sending as LCOV, JSON, merging the files together.  Days lost.

// Run the Puppeteer style tests, the coverage is output to the temp .nyc_output folder
await execSync('npm run test -- src/pages/Pages/__tests__/general.spec.ts');

// the Puppeteer style tests we convert to JSON
await execSync('npx nyc report --reporter=json --report-dir=./coverage-puppeteer');

// RTL/unit tests
await execSync('npm run test:coverage -- --coverageReporters=json --coverageDirectory=./coverage-rtl --testPathIgnorePatterns="general.*" --coveragePathIgnorePatterns="general.*"');

// we expect that we have both coverage suites
// we merge them together and output them to a JSON file
await execSync('npx istanbul-merge --out ./coverage.json ./coverage-rtl/coverage-final.json ./coverage-puppeteer/coverage-final.json');

// convert the JSON to HTML
// for some reason GitHub actions can't run this command therefore we only run it coverage locally
if (!process.env.CI) {
  await execSync('npx istanbul report --include ./coverage.json --dir coverage html');
}