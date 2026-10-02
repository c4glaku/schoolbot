const assert = require('node:assert/strict');
const test = require('node:test');
const { generateFeedback } = require('./gradeController');

test('applies the rubric through one private Responses API request', async () => {
  let request;
  const client = {
    responses: {
      async create(options) {
        request = options;
        return { output_text: '  Clear and constructive feedback.  ' };
      },
    },
  };

  const feedback = await generateFeedback('The student answer.', 'Award one point for a correct explanation.', client);

  assert.equal(feedback, 'Clear and constructive feedback.');
  assert.equal(request.store, false);
  assert.equal(request.reasoning.effort, 'none');
  assert.match(request.input, /Award one point for a correct explanation/);
  assert.match(request.input, /The student answer/);
});

test('fails clearly when the model returns no feedback', async () => {
  const client = { responses: { create: async () => ({ output_text: ' ' }) } };

  await assert.rejects(
    generateFeedback('Submission', 'Criteria', client),
    /returned empty feedback/,
  );
});
