#ProctorLite

A lightweight online quiz platform with built-in **tab-switch detection**. Teachers create multiple-choice quizzes and share an access code. Students join with their name, take the quiz one question at a time, and every time they leave the quiz tab it is detected, logged, and reported to the teacher by email.

> **Live demo:** _add your Vercel link here_
> **API docs:** _add your backend `/docs` link here_

<!-- Add a screenshot or GIF here: ![ProctorLite demo](docs/demo.gif) -->

---

##Features

For teachers
- Create a quiz with any number of multiple-choice questions
- Get a short, shareable **access code** (no student accounts needed)
- Receive an **email alert** whenever a student leaves the quiz tab

For students
- Join with just a name and an access code
- Answer one question at a time with live progress
- See a live **tab-switch counter** during the quiz
- See a clear result at the end: score, or a failed notice if the rules were broken

Under the hood
- Tab switching detected with the browser's Page Visibility API, wrapped in a reusable custom React hook
- Every violation stored as a **timestamped record** in the database, not just a counter
- **Scoring happens on the server.** Correct answers are never sent to the student's browser, so they can't be read from the network tab
- Answers are saved question by question, so progress isn't lost if the browser closes
- Input validation on both forms, with clear inline errors
- Configurable strictness: one constant (`MAX_VIOLATIONS`) controls how many tab switches fail a quiz

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Email | Resend |
| Hosting | Vercel (frontend), Render (backend + database) |

---

## How It Works

```
Teacher creates quiz ──► access code
                              │
Student enters name + code ───┘
        │
        ▼
Attempt created ──► questions sent (without correct answers)
        │
        ▼
Student answers ──► each answer saved to the server
        │
        ├── leaves the tab ──► violation logged ──► teacher emailed
        │
        ▼
Quiz finished ──► server calculates score ──► result shown
```

### Database design

| Table | Stores |
|---|---|
| `quizzes` | title, access code, teacher email |
| `questions` | question text, options (JSON), correct answer index, linked to a quiz |
| `attempts` | one student's run through a quiz: name, answers (JSON), score, timestamps |
| `violations` | one row per detected violation: type and timestamp, linked to an attempt |

Tables are linked by foreign keys: `questions.quiz_id → quizzes.id`, `attempts.quiz_id → quizzes.id`, `violations.attempt_id → attempts.id`.

### API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/quizzes` | Create a quiz with its questions, returns the access code |
| POST | `/quizzes/join` | Join a quiz by access code, returns the attempt and questions |
| POST | `/attempts/{id}/answer` | Save one answer |
| POST | `/attempts/{id}/finish` | Finish the attempt and calculate the score |
| POST | `/attempts/{id}/violation` | Log a violation and email the teacher |

Interactive docs are available at `/docs` when the backend is running.

---

## Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (with an empty database named `proctorlite`)
- A [Resend](https://resend.com) API key

### 1. Clone the repo
```bash
git clone https://github.com/Sumayya-111/proctorLite.git
cd proctorLite
```

### 2. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost/proctorlite
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=http://localhost:5173
```

Start the server (tables are created automatically on first run):
```bash
uvicorn main:app --reload
```
The API runs at `http://127.0.0.1:8000`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`. To point it at a different backend, set `VITE_API_URL` in `frontend/.env`.

---

##  Deployment

| Part | Platform | Key settings |
|---|---|---|
| Database | Render Postgres (or Neon) | Copy the connection URL |
| Backend | Render Web Service | Root dir `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Frontend | Vercel | Root dir `frontend`, env var `VITE_API_URL` = backend URL |

Backend environment variables: `DATABASE_URL`, `RESEND_API_KEY`, `FRONTEND_URL` (your Vercel URL, needed for CORS).

---

## Limitations

Being upfront about what this can and can't do:

- **It detects suspicious behavior, it can't guarantee nobody cheats.** A browser website can't control what a student does outside the page. A student using a second device or a second monitor without switching tabs will not be detected.
- Detection currently covers leaving or hiding the quiz tab. It doesn't yet cover fullscreen exit, copy/paste, or right-click.
- On Resend's free test sender, emails can only be delivered to the account owner's address until a custom domain is verified.
- There are no teacher accounts yet. Quizzes are identified by access code only.

---

## Roadmap

- [ ] Teacher dashboard: results and violation timeline per student
- [ ] Teacher authentication
- [ ] React Router with real URLs (`/join`, `/teacher`)
- [ ] More detection signals: fullscreen exit, copy/paste, right-click, window blur
- [ ] Per-quiz settings (violation limit, time limit)
- [ ] One summary email per attempt instead of one email per violation

---

## Project Structure

```
proctorLite/
├── backend/
│   ├── main.py          # FastAPI app and endpoints
│   ├── models.py        # SQLAlchemy tables
│   ├── schemas.py       # Pydantic request schemas
│   └── database.py      # Database connection
└── frontend/
    └── src/
        ├── components/  # CreateQuiz, JoinQuiz, TakeQuiz
        ├── hooks/       # useTabFocus (violation detection)
        ├── api.js       # All backend calls in one place
        └── App.jsx      # Layout and navigation
```

---

## Author

Built by **Sumayya** · [GitHub](https://github.com/Sumayya-111)
