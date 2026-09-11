# Web Scraping Agent Microservice

FastAPI microservice using Playwright to interface with ChatGPT web automation.

## Running locally
```bash
uv venv
uv pip install fastapi "uvicorn[standard]" pydantic playwright httpx pytest
uv run playwright install chromium
uv run uvicorn main:app --reload --port 8001
```

## API Endpoints
- `GET /health`: Health status & textbox sensing check.
- `POST /api/v1/prompt`: Execute a prompt and get JSON response.
