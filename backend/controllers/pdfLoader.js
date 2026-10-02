const pdf = require('pdf-parse');

async function loadTextFromPdf(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

module.exports = { loadTextFromPdf };
