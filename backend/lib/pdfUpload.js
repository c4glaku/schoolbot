const path = require('path');
const multer = require('multer');

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter(_request, file, callback) {
    if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
    return callback(null, true);
  },
});

module.exports = uploadPdf;
