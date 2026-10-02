const { OpenAI } = require('openai');

const MODEL = process.env.OPENAI_MODEL || 'gpt-6-luna';
let client;

function getOpenAIClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
    if (!apiKey) {
      throw new Error('Set OPENAI_API_KEY in backend/.env before using AI features.');
    }

    client = new OpenAI({ apiKey });
  }

  return client;
}

module.exports = { MODEL, getOpenAIClient };
