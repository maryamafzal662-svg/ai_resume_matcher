# AI Resume Matcher

This repository contains a Django backend and a React frontend for matching resumes to job descriptions.

Quick start

1. Create a local virtual environment and install backend dependencies.

```powershell
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill values (do not commit `.env`).

3. Run migrations and start the server.

```powershell
python manage.py migrate
python manage.py runserver
```

Frontend

```powershell
cd ai_resume_frontend
npm install
npm start
```

Security

- Do NOT commit secrets. Rotate any leaked API keys immediately (see `SECURITY.md`).
- Use GitHub Secrets for CI and deployments.
