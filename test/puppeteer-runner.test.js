import assert from 'node:assert';
import { test } from 'node:test';
import puppeteer from 'puppeteer';
import path from 'node:path';

test('Game balance tester (Puppeteer)', { timeout: 300000 }, async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  const filePath = path.resolve(process.cwd(), 'balance-tester.html');
  await page.goto(`file://${filePath}`);

  // Wait for the results to appear on the page
  try {
    await page.waitForSelector('#results', { timeout: 60000 });

    const results = await page.$eval('#results', el => el.textContent);
    console.log('Balance Test Results:');
    console.log(JSON.parse(results));

    // A simple assertion to make sure we got some results
    assert.ok(results, 'Should have results');
  } catch (e) {
    console.error('Error in puppeteer test:', e);
    const body = await page.evaluate(() => document.body.innerHTML);
    console.log('Page body:', body);
    assert.fail('Puppeteer test failed');
  } finally {
    await browser.close();
  }
});
