# SchoolBot

SchoolBot is a React application for creating questions from course PDFs and generating feedback on student submissions. The existing Material UI screens and light/dark themes are retained.

## Project status

- The Express API and React interface are the active application.
- Question generation accepts text-based PDFs, creates up to 20 multiple-choice or short-answer questions, and returns a PDF.
- Grading accepts up to five text-based PDFs and returns feedback for each one.
- AI features require an OpenAI API key. The default model is `gpt-6-luna`; set `OPENAI_MODEL` to use another model available to your API account.
- Scanned PDFs without selectable text are not OCR processed. The experimental `backend/ml_service.py` is not called by the Node API and is not part of the install or test path.
- The app does not include user accounts or authentication.

## Requirements

- Node.js 22.12 or newer
- npm
- An OpenAI API key for question generation and grading

## Setup

Install dependencies from the repository root:

```bash
npm install
```

Create `backend/.env` with your API key:

```env
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-6-luna
PORT=5000
```

The previous `OPENAI_KEY` variable remains supported. Keep API keys in the backend environment; never add them to frontend variables.

Run the API and frontend in separate terminals from the repository root:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Vite serves the frontend at `http://localhost:5173` and forwards `/api` requests to the Express API on port 5000. To use a separately hosted API, set `VITE_API_BASE_URL` to its URL when building the frontend.

## Tests and production build

```bash
npm test
npm run build
```

Backend unit tests use Node's built-in test runner. Frontend tests use Vitest and React Testing Library. Tests stub AI responses and do not require an API key.

## Upload limits

The API accepts PDFs up to 10 MB. Grading accepts at most five files per request. Question generation samples up to 20 sections across a PDF and uses one model request for the requested question set. Grading runs one request per submission, concurrently.
