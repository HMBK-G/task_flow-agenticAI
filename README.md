# TaskFlow - AI Club Workflow Management System

This project has been migrated from Base44 to a custom Python backend.

## Structure

- `/src`: React frontend (Vite + Tailwind + Shadcn UI).
- `/backend`: FastAPI backend server.

## Getting Started

### 1. Backend

Install Python dependencies:
```bash
cd backend
pip install -r requirements.txt
```

Run the backend:
```bash
python main.py
```
The API will be available at `http://localhost:8000`.

### 2. Frontend

Install Node dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

## AI Integration

The backend is ready for AI integration. You can add your LLM API keys in `backend/main.py` or a `.env` file to enable automated task assignment and analysis.
