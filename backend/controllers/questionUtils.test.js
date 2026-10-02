const assert = require('node:assert/strict');
const test = require('node:test');
const { createQuestionPrompt, sampleContexts } = require('./questionUtils');
const { createQuestionGenerator } = require('./questionGenerator');

test('samples a bounded set of contexts across a long document', () => {
  const text = Array.from({ length: 100 }, (_, index) => String.fromCharCode(65 + index % 26).repeat(1000)).join('');
  const contexts = sampleContexts(text, 50);

  assert.equal(contexts.length, 20);
  assert.ok(contexts.every((context) => context.length <= 1000));
  assert.equal(contexts[0][0], 'A');
  assert.equal(contexts.at(-1).at(-1), 'V');
});

test('does not produce contexts for an empty document', () => {
  assert.deepEqual(sampleContexts('   ', 4), []);
});

test('includes the requested format and source text in the prompt', () => {
  const prompt = createQuestionPrompt(['Photosynthesis converts light into energy.'], 'mcq', 'easy', 2);

  assert.match(prompt, /exactly 2/);
  assert.match(prompt, /four options labeled A, B, C, and D/);
  assert.match(prompt, /Photosynthesis converts light into energy/);
});

test('generates a set of questions with one structured API request', async () => {
  let request;
  let requestCount = 0;
  const client = {
    responses: {
      async create(options) {
        request = options;
        requestCount += 1;
        return { output_text: JSON.stringify({ questions: ['Question one?', 'Question two?'] }) };
      },
    },
  };
  const generateQuestions = createQuestionGenerator({
    loadPdfText: async () => 'Course material. '.repeat(1500),
    getClient: () => client,
  });

  const questions = await generateQuestions(Buffer.from('pdf'), 'short', 'medium', 2);

  assert.deepEqual(questions, ['Question one?', 'Question two?']);
  assert.equal(requestCount, 1);
  assert.equal(request.store, false);
  assert.equal(request.reasoning.effort, 'none');
  assert.equal(request.text.format.type, 'json_schema');
  assert.match(request.input, /Course material/);
});

test('rejects question counts outside the supported range', async () => {
  const generateQuestions = createQuestionGenerator({
    loadPdfText: async () => 'Unused',
    getClient: () => {
      throw new Error('The API client should not be created.');
    },
  });

  await assert.rejects(generateQuestions(Buffer.from('pdf'), 'mcq', 'easy', 21), RangeError);
});
