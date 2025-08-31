import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('persistLlmNodes removes volatile flags', async () => {
  const code = await fs.readFile(new URL('../scripts/dialog-persist.js', import.meta.url), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context);
  const tree = {
    start: {
      text: 'hi',
      generated: true,
      choices: [
        { label: 'A', to: 'a', generated: true, volatile: true },
        { label: 'B', to: 'b' }
      ]
    }
  };
  context.persistLlmNodes(tree);
  assert.ok(!tree.start.generated);
  assert.ok(!tree.start.choices[0].generated);
  assert.ok(!tree.start.choices[0].volatile);
});
