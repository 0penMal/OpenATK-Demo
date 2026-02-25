# OpenATK Demo

Small full‑stack demo for experimenting with “levels” of prompt guardrails in a chat UI.

- **Backend:** FastAPI + OpenAI API + PostgreSQL logging
- **Frontend:** React + Vite

## Repo layout

- `Backend/app.py` — FastAPI API server
- `Backend/database_test.py` — quick DB connectivity check
- `Backend/requirements.txt` — backend Python dependencies
- `Backend/pyproject.toml`, `Backend/uv.lock` — backend project metadata/lockfile
- `Frontend/demo-project/` — React app

## Prerequisites

- Python **3.12+**
- Node.js **18+** (recommended) + npm
- A PostgreSQL database (local or remote)
- An OpenAI API key

## Quickstart (local dev)

### 1) Backend

Create an environment file:

```bash
cp Backend/.env.example Backend/.env
```

Set:

- `OPENAI_API_KEY` — your OpenAI API key
- `DATABASE_URL` — PostgreSQL connection string, e.g. `postgresql://user:pass@localhost:5432/demo`

Install Python deps and run the API:

```bash
cd Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The API listens on `http://127.0.0.1:8000`.

### 2) Database schema

The backend expects two tables: `attempts` and `chat_logs`.

Example schema (PostgreSQL):

```sql
CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_seconds int,
  final_level int,
  finished_reason text,
  prompt_count int
);

CREATE TABLE IF NOT EXISTS chat_logs (
  id bigserial PRIMARY KEY,
  attempt_id uuid NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  level int NOT NULL,
  user_prompt text NOT NULL,
  bot_reply text NOT NULL,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Notes:

- `gen_random_uuid()` requires `pgcrypto` on many Postgres installs:
  - `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

### 3) Frontend

```bash
cd Frontend/demo-project
npm install
npm run dev
```

Open `http://localhost:5173`.

## Configuration

- **Frontend API base URL:** hardcoded as `API = "http://127.0.0.1:8000"` in `Frontend/demo-project/src/pages/ChatPage.jsx`.
- **CORS:** backend allows `http://localhost:5173` in `Backend/app.py`. If you change the frontend origin (or deploy), update `allow_origins`.

## API endpoints

- `POST /attempts/start` → `{ attempt_id }`
- `POST /chat` body: `{ level, prompt, attempt_id }` → `{ output }`
- `POST /attempt` body: `{ level, guess }` → `{ correct, new_level, end }`
- `POST /attempts/finish` body: `{ attempt_id, final_level, finished_reason }` → `{ duration_seconds, prompt_count, final_level }`
- `GET /level/{level}` → `{ level, desc }`

## Security notes

- Never commit `.env` (it contains secrets). Use `Backend/.env.example` for templates.
- If an API key or DB password was ever committed/shared, rotate it immediately.
