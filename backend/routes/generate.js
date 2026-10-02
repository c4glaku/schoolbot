const express = require('express');
const router = express.Router();
const uploadPdf = require('../lib/pdfUpload');
const { generateQuestions } = require('../controllers/generateController');

router.post('/generate-questions', uploadPdf.single('file'), generateQuestions);

module.exports = router;
