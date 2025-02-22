const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, 'uploads/') });
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const indexRoutes = require('./routes/index');
const generateRoutes = require('./routes/generate');
const gradeRoutes = require('./routes/grade');

app.use('/', indexRoutes);
app.use('/generate', generateRoutes);
app.use('/grade', gradeRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
