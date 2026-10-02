const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const uploadPdf = require('../lib/pdfUpload');

router.post('/', uploadPdf.array('studentSubmissions', 5), gradeController.gradeSubmissions);

module.exports = router;
