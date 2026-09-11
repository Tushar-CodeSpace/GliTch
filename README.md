# GliTch Application

Full-stack web application with a **React** (Vite) frontend and a **Python FastAPI** backend managed via **uv**.

---

## Project Structure

```text
GliTch/
├── backend/
│   ├── main.py           # FastAPI application entry point with CORS and REST routes
│   ├── pyproject.toml    # Python dependencies and metadata managed by uv
│   └── README.md         # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main React UI dashboard component
│   │   ├── main.jsx      # React DOM entry point
│   │   └── index.css     # Global styling, tokens, and layout styles
│   ├── index.html        # HTML entry layout
│   ├── vite.config.js    # Vite configuration and API proxy (/api -> localhost:8000)
│   └── package.json      # Node.js dependencies
├── .gitignore        # Git ignore rules for Python venv, node_modules, build artifacts
├── docker-compose.yml# Docker Compose orchestration config
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **`uv`** package manager
- **Node.js 18+** and `npm`

---

### 2. Backend Setup (`FastAPI` + `uv`)

Execute the following commands in your terminal:

```bash
cd backend

# Create virtual environment and install dependencies
uv venv
uv pip install fastapi "uvicorn[standard]" pydantic

# Start the FastAPI development server
uv run uvicorn main:app --reload --port 8000
```

- **Interactive API Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check Endpoint**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### 3. Frontend Setup (`React` + `Vite`)

In a separate terminal window, execute:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

- **Frontend Application URL**: [http://localhost:5173](http://localhost:5173)

---

### 4. Running via Docker Compose

To launch the full-stack application inside isolated containers with one command:

```bash
docker compose up --build
```

- **Frontend Application**: [http://localhost](http://localhost) (Port 80)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000) (Port 8000)

---

## API Endpoints

- `GET /api/health`: Check backend operational status and system information.
- `GET /api/items`: Fetch list of application items.
- `POST /api/items`: Create a new application item.
- `DELETE /api/items/{id}`: Delete an item by ID.
