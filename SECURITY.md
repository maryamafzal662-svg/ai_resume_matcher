Security and leaked-secret steps
--------------------------------

1. If you committed an API key or secret, rotate/revoke it immediately (OpenAI: https://platform.openai.com/account/api-keys).
2. Remove secrets from the repo and rewrite history (already done in this repo).
3. Add secrets to your deployment environment or GitHub Actions secrets instead of committing them.
4. Keep a `.env.example` with placeholder values (see `.env.example`).
