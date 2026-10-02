const { loadTextFromPdf } = require('./pdfLoader');
const { MODEL, getOpenAIClient } = require('../lib/openaiClient');
const { createQuestionPrompt, sampleContexts } = require('./questionUtils');

const questionsSchema = {
  type: 'object',
  properties: {
    questions: { type: 'array', items: { type: 'string' } },
  },
  required: ['questions'],
  additionalProperties: false,
};

function createQuestionGenerator({ loadPdfText = loadTextFromPdf, getClient = getOpenAIClient } = {}) {
  return async function generateQuestions(fileBuffer, questionType, difficulty, numQuestions) {
    const count = Number(numQuestions);
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      throw new RangeError('Question count must be an integer from 1 to 20.');
    }

    const text = await loadPdfText(fileBuffer);
    const contexts = sampleContexts(text, count);
    if (contexts.length === 0) {
      throw new Error('The PDF does not contain any readable text.');
    }

    const response = await getClient().responses.create({
      model: MODEL,
      instructions: 'You create accurate educational questions from teacher-provided course material.',
      input: createQuestionPrompt(contexts, questionType, difficulty, count),
      max_output_tokens: Math.min(6000, 150 + count * 250),
      reasoning: { effort: 'none' },
      store: false,
      text: {
        format: {
          type: 'json_schema',
          name: 'generated_questions',
          strict: true,
          schema: questionsSchema,
        },
      },
    });

    let result;
    try {
      result = JSON.parse(response.output_text);
    } catch {
      throw new Error('The AI service returned an invalid question response.');
    }

    if (!result || !Array.isArray(result.questions)) {
      throw new Error('The AI service returned no questions.');
    }

    const questions = result.questions
      .filter((question) => typeof question === 'string' && question.trim())
      .map((question) => question.trim())
      .slice(0, count);

    if (questions.length !== count) {
      throw new Error('The AI service returned fewer questions than requested.');
    }

    return questions;
  };
}

const generateQuestions = createQuestionGenerator();

module.exports = { createQuestionGenerator, generateQuestions };
