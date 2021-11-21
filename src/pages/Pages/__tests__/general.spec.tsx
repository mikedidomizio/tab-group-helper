import * as path from 'path';

const pti = require('puppeteer-to-istanbul');
const puppeteer = require('puppeteer');

const isVisible = async (page: any, element: any) =>
  page.evaluate((element2: any) => {
    const e = document.querySelector(element2);
    if (!e) return false;
    const style = window.getComputedStyle(e);
    return (
      style &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }, element);

describe('general page', () => {
  let page: any;
  let browser: any;
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
    });
    page = await browser.newPage();

    await Promise.all([
      page.coverage.startJSCoverage(),
      //  page.coverage.startCSSCoverage(),
    ]);
  });

  afterAll(async () => {
    const [jsCoverage /*cssCoverage*/] = await Promise.all([
      page.coverage.stopJSCoverage(),
      // page.coverage.stopCSSCoverage()
    ]);
    let totalBytes = 0;
    let usedBytes = 0;

    const coverage = [...jsCoverage];
    for (const entry of coverage) {
      totalBytes += entry.text.length;
      for (const range of entry.ranges)
        usedBytes += range.end - range.start - 1;
    }
    console.log(`Bytes used: ${(usedBytes / totalBytes) * 100}%`);
    // todo temp hack to get rid of the super long full pathname in instanbul, this is just cleaner looking
    jsCoverage[0].url = '/src/pages/Pages/general.js';
    pti.write([...jsCoverage], {
      includeHostname: false,
      storagePath: './.nyc_output',
    });
    await browser.close();
  });

  it('if "installed" is in query string it should have a thank you message', async () => {
    await page.goto(
      `file:${path.join(
        process.cwd(),
        './src/pages/Pages/general.html?installed'
      )}`,
      {
        waitUntil: 'networkidle0',
      }
    );

    page.on('console', (consoleObj: any) => console.log(consoleObj.text()));

    expect(await isVisible(page, 'h1')).toBe(true);
  });

  it('if "installed" is not in query string it should not have a thank you message', async () => {
    await page.goto(
      `file:${path.join(process.cwd(), './src/pages/Pages/general.html')}`,
      {
        waitUntil: 'networkidle0',
      }
    );

    expect(await isVisible(page, 'h1')).toBe(false);
  });
});
