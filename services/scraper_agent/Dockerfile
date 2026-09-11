FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

# Copy uv binary from official Astral image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency definition and source files
COPY pyproject.toml README.md ./
COPY schemas.py browser_agent.py main.py ./

# Install python dependencies via uv
RUN uv pip install --system fastapi "uvicorn[standard]" pydantic playwright httpx pytest

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
