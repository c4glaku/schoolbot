require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const indexRoutes = require('./routes/index');
const generateRoutes = require('./routes/generate');
const gradeRoutes = require('./routes/grade');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/', indexRoutes);
app.use('/generate', generateRoutes);
app.use('/grade', gradeRoutes);

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'PDF files must be 10 MB or smaller.'
      : 'Upload up to five PDF files only.';
    return response.status(400).send(message);
  }

  console.error('Unhandled API error:', error.message);
  return response.status(500).send('An unexpected server error occurred.');
});

if (require.main === module) {
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
