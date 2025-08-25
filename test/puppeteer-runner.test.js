import assert from 'node:assert';
import { test } from 'node:test';
import path from 'node:path';

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  test('Game balance tester (Puppeteer)', { skip: true }, () => {});
}

if (puppeteer) {
  test('Game balance tester (Puppeteer)', { timeout: 300000 }, async t => {
    let browser;
    try {
      browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--allow-file-access-from-files'
        ]
      });
    } catch (err) {
      t.skip(`Puppeteer launch failed: ${err.message}`);
      return;
    }
    const page = await browser.newPage();

    const progress = { boot: false, play: false, results: false };
    page.on('console', msg => {
      const text = msg.text();
      console.log('PAGE LOG:', text);
      if (text.includes('Balance tester agent loaded')) progress.boot = true;
      if (text.includes('Running balance test')) progress.play = true;
    });

    const filePath = path.resolve(process.cwd(), 'balance-tester.html');
    await page.goto(`file://${filePath}`);

    try {
      await page.waitForSelector('#results', { timeout: 60000 });
      progress.results = true;
      const results = await page.$eval('#results', el => el.textContent);
      console.log('Balance Test Results:');
      console.log(JSON.parse(results));
      assert.ok(results, 'Should have results');
    } catch {
      let status = 'init';
      if (progress.results) status = 'results';
      else if (progress.play) status = 'play';
      else if (progress.boot) status = 'boot';
      assert.fail(`Balance test failed after 60s (last checkpoint: ${status})`);
    } finally {
      await browser.close();
    }
  });
}
