const fs = require('fs');
const pdf = require('pdf-parse');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
}

async function generateFeedback(text, gradingCriteria) {
    const prompt = `Based on the following grading criteria: "${gradingCriteria}", provide detailed feedback for the following student submission:
    ${text}
    
    Feedback:`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an assistant that helps grade and provide feedback on student submissions." },
                { role: "user", content: prompt }
            ],
            max_tokens: 200, // modify for a wider context window-larger pdfs
            temperature: 0.7, // modify for a wider range of different responses
        });

        if (response.choices && response.choices.length > 0) {
            return response.choices[0].message.content.trim();
        } else {
            console.error("Unexpected response structure:", response);
            return "Unable to generate feedback.";
        }
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return "Error generating feedback.";
    }
}

exports.gradeSubmissions = async (req, res) => {
    const files = req.files;
    const gradingCriteria = req.body.gradingCriteria;

    if (!files || files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    if (!gradingCriteria) {
        return res.status(400).send('Grading criteria is required.');
    }

    try {
        const feedbacks = [];

        for (const file of files) {
            const filePath = file.path;
            const text = await extractTextFromPDF(filePath);
            const feedback = await generateFeedback(text, gradingCriteria);
            feedbacks.push({
                fileName: file.originalname,
                feedback: feedback
            });

            // Clean up the uploaded file
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.json(feedbacks);
    } catch (error) {
        console.error('Error grading submissions:', error);
        res.status(500).send('An error occurred while grading the submissions.');
    }
};
