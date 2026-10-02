const PDFDocument = require('pdfkit');
const { generateQuestions } = require('./questionGenerator');

function createQuestionsPdf(questions) {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({ margin: 54 });
    const parts = [];

    document.on('data', (part) => parts.push(part));
    document.on('end', () => resolve(Buffer.concat(parts)));
    document.on('error', reject);

    document.fontSize(20).text('Generated Questions', { align: 'center' });
    questions.forEach((question, index) => {
      document.moveDown(1.2);
      document.fontSize(13).text(`Question ${index + 1}`);
      document.moveDown(0.35);
      document.fontSize(11).text(question, { lineGap: 4 });
    });
    document.end();
  });
}

async function handleGenerateQuestions(req, res) {
  const file = req.file;
  const { questionType, difficulty, numQuestions } = req.body;

  if (!file) return res.status(400).send('Upload a PDF file.');
  if (!['mcq', 'short'].includes(questionType)) {
    return res.status(400).send('Choose a supported question type.');
  }
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).send('Choose a supported difficulty.');
  }
  if (!Number.isInteger(Number(numQuestions)) || Number(numQuestions) < 1 || Number(numQuestions) > 20) {
    return res.status(400).send('Choose between 1 and 20 questions.');
  }

  try {
    const questions = await generateQuestions(file.buffer, questionType, difficulty, Number(numQuestions));
    const pdf = await createQuestionsPdf(questions);
    return res.type('application/pdf').attachment('generated_questions.pdf').send(pdf);
  } catch (error) {
    console.error('Question generation failed:', error.message);
    return res.status(500).send('Could not generate questions. Check the backend configuration and try again.');
  }
}

module.exports = { createQuestionsPdf, generateQuestions: handleGenerateQuestions };
