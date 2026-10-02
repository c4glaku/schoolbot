const assert = require('node:assert/strict');
const test = require('node:test');
const { createQuestionsPdf } = require('./generateController');

test('creates a PDF containing a generated question set', async () => {
  const pdf = await createQuestionsPdf(['What is photosynthesis?', 'Name one plant cell structure.']);

  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.ok(pdf.length > 500);
});
