// const { OpenAIEmbeddings } = require("@langchain/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter")
// const { HfInference } = require('@huggingface/inference');
const { loadPDFFromFile } = require("./pdfLoader");
// const { cosineDistance } = require('ml-distance');
const { OpenAI } = require('openai')

const debug = 0;

// TODO: Further Investigate the Feasability of Multi-Modal (Training Own Model on HuggingFace)


/* Initialize the Hugging Face Inference client


// Initialize embeddings
async function generateEmbedding(text) {
    const result = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
    });
    return result;
}

const embeddings = {
    embedQuery: generateEmbedding
};

*/

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
  });

async function generateQuestions(filePath, questionType, difficulty, numQuestions) {
    try {
      const pdfContent = await loadPDFFromFile(filePath);
      
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.createDocuments([pdfContent]);
      
      const questions = [];
      
      for (const chunk of chunks) {
        if (questions.length >= numQuestions) break;
        
        const prompt = `Generate a ${difficulty} difficulty ${questionType} question based on the following context. The question should start with "Q:" and be followed by the question text. 
        For multiple-choice questions, include four options labeled A, B, C, and D, with the correct answer indicated, each option being on a separate line.
          Context: ${chunk.pageContent}
          Generated Question:`;
        
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant that generates educational questions." },
              { role: "user", content: prompt }
            ],
            max_tokens: 150,
            temperature: 0.7,
          });
  
          if (debug) console.log("API Response:", JSON.stringify(response, null, 2));  // Log the entire response
  
          if (response.choices && response.choices.length > 0) {
            const generatedText = response.choices[0].message.content.trim();
            const questionMatch = generatedText.match(/Q:\s*(.+)(\n|$)/s);
            
            if (questionMatch) {
              questions.push(questionMatch[1].trim());
            }
          } else {
            console.error("Unexpected response structure:", response);
          }
        } catch (apiError) {
          console.error("Error calling OpenAI API:", apiError);
        }
        
        if (questions.length >= numQuestions) break;
      }
      
      console.log("Generated questions:", questions);
      return questions;
    } catch (error) {
      console.error("Error in generateQuestions:", error);
      throw error;
    }
}

/* From failed attempts trying to use other APIs ...  
async function selectRelevantChunk(chunkEmbeddings, existingQuestions) {
    if (existingQuestions.length === 0) {
        return Math.floor(Math.random() * chunkEmbeddings.length);
    }

    const lastQuestionEmbedding = await generateEmbedding(existingQuestions[existingQuestions.length - 1]);

    let maxDistance = -Infinity;
    let selectedIndex = 0;

    for (let i = 0; i < chunkEmbeddings.length; i++) {
        const distance = 1 - cosineSimilarity(lastQuestionEmbedding, chunkEmbeddings[i]);
        if (distance > maxDistance) {
            maxDistance = distance;
            selectedIndex = i;
        }
    }

    return selectedIndex;
}

function createPrompt(questionType, difficulty, context) {
    return `
    Generate a single ${difficulty} difficulty ${questionType} question based on the following context. The question should be specific to the content and start with "Q:".

    Context: ${context}

    ${questionType === 'mcq' ? 'Include four options labeled A, B, C, and D, with the correct answer indicated.' : ''}

    Generated Question:
    `;
}

function processGeneratedText(text) {
    const questionMatch = text.match(/Q:\s*(.+?)(?:\n|$)/s);
    if (questionMatch) {
        let question = questionMatch[1].trim();
        if (question.toLowerCase().startsWith('q:')) {
            question = question.slice(2).trim();
        }
        return question;
    }
    return null;
}

function cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
}

async function isQuestionRelevant(question, context) {
    if (!question) return false;
    const questionEmbedding = await generateEmbedding(question);
    const contextEmbedding = await generateEmbedding(context);
    const relevance = cosineSimilarity(questionEmbedding, contextEmbedding);
    console.log("Question relevance:", relevance);
    return relevance > 0.5; 
} */

module.exports = { generateQuestions };
