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

    let lastCheckpoint = 'init';
    const errors = [];
    page.on('console', msg => {
      const text = msg.text();
      console.log('PAGE LOG:', text);
      if (msg.type() === 'error') errors.push(text);
      if (text.includes('Balance tester agent loaded')) lastCheckpoint = 'boot';
      else if (text.includes('Running balance test')) lastCheckpoint = 'play';
      else if (text.startsWith('Balance test checkpoint: ')) {
        lastCheckpoint = text.replace('Balance test checkpoint: ', '');
      }
    });
    page.on('pageerror', err => {
      errors.push(err.message);
    });
    page.on('error', err => {
      errors.push(err.message);
    });

    const filePath = path.resolve(process.cwd(), 'balance-tester.html');
    await page.goto(`file://${filePath}`);

    try {
      await page.waitForSelector('#results', { timeout: 60000 });
      lastCheckpoint = 'results';
      const results = await page.$eval('#results', el => el.textContent);
      const stats = JSON.parse(results);
      console.log('Balance Test Results:');
      console.log(stats);
      assert.ok(results, 'Should have results');
      assert.ok(stats.pathDistance > 0, 'Pathfinding made no progress');
    } catch {
      const errorText = errors.length ? ` Errors: ${errors.join(' | ')}` : '';
      assert.fail(`Balance test failed after 60s (last checkpoint: ${lastCheckpoint}).${errorText}`);
    } finally {
      await browser.close();
    }
  });
}
