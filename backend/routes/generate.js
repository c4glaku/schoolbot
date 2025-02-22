const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { generateQuestions } = require('../controllers/generateController');

router.post('/generate-questions', upload.single('file'), generateQuestions);

module.exports = router;
