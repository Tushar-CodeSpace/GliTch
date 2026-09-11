FROM python:3.12-slim

# Copy uv binary from official Astral image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy configuration and code
COPY pyproject.toml README.md main.py /app/
COPY tests /app/tests

# Install python dependencies
RUN uv pip install --system fastapi "uvicorn[standard]" pydantic pytest httpx

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
