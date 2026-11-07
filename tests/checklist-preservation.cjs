const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { getSchema } = require('@tiptap/core');

test('admin editor retains nested checklist nodes and completion when editing Front content', () => {
  let config;
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '../src/components/RichTextEditor/useRichTextEditor.ts'), 'utf8');
  new Function('exports', 'require', ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText)(exports, name => name === 'react' ? { useEffect() {} }
    : name === '@tiptap/react' ? { useEditor: options => { config = options; return null; } } : require(name));
  exports.useRichTextEditor({});
  const schema = getSchema(config.extensions);
  const paragraph = text => ({ type: 'paragraph', content: [{ type: 'text', text }] });
  const document = { type: 'doc', content: [{ type: 'taskList', content: [{
    type: 'taskItem', attrs: { checked: true }, content: [paragraph('Completed task'),
      { type: 'taskList', content: [{ type: 'taskItem', attrs: { checked: false }, content: [paragraph('Pending child')] }] }],
  }] }] };
  const restored = schema.nodeFromJSON(document);
  restored.check();
  assert.equal(restored.firstChild.firstChild.attrs.checked, true);
  assert.equal(restored.firstChild.firstChild.lastChild.firstChild.attrs.checked, false);
  assert.equal(restored.textContent, 'Completed taskPending child');
});
