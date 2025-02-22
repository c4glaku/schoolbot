const { generateQuestions } = require('./questionGenerator');
const pdf = require('html-pdf');
const fs = require("fs");

exports.generateQuestions = async (req, res) => {
    const filePath = req.file.path;
    
    try {
        console.log('Request received:', req.body);
        console.log('Uploaded file:', req.file);

        const { questionType, difficulty, numQuestions } = req.body;
        
        if (!fs.existsSync(filePath)) {
            console.error('File does not exist:', filePath);
            return res.status(500).send('Uploaded file not found');
        }

        const questions = await generateQuestions(filePath, questionType, difficulty, numQuestions);

        // Generate HTML from questions
        const htmlContent = generateHtml(questions);
        
        // Convert HTML to PDF
        pdf.create(htmlContent).toBuffer((err, buffer) => {
            if (err) {
                console.error('PDF generation failed:', err);
                return res.status(500).send('PDF generation failed');
            }
            
            res.contentType('application/pdf');
            res.send(buffer);
        });

        // Clean up the uploaded file
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred');
    }
};

function generateHtml(questions) {
    let html = '<h1>Generated Questions</h1>';
    questions.forEach((question, index) => {
        html += `<h2>Question ${index + 1}</h2>`;
        html += `<p>${question}</p>`;
    });
    return html;
}