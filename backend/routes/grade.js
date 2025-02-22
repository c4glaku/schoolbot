const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('studentSubmissions'), gradeController.gradeSubmissions);

module.exports = router;
