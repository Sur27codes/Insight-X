# InsightX — Business Forecasting Engine

## 🚀 One-Command Start

```bash
./start.sh "Forecast the next 90 days of revenue"
```

This will:
1. Start all services (Frontend, Backend, Postgres, Redis, MinIO, MLflow, MCP).
2. Seed the application with your prompt.
3. Launch the UI at [http://localhost:3000](http://localhost:3000).

## 🏗 Architecture

- **Frontend**: Next.js 14 (App Router), Tailwind, Glassmorphism UI, Recharts.
- **Backend**: Python FastAPI, SQLAlchemy, Redis PubSub (Real-time events).
- **Forecasting**: Prophet/XGBoost (Stubbed mechanics), MLflow tracking.
- **Data Lake**: MinIO (S3 compatible) for dataset storage.
- **AI Agent**: CopilotKit (Frontend) + MCP Server (Tools).

## 🛠 Configuration

Create a `.env` file (copied automatically from `.env.example` by start script):

```env
OPENAI_API_KEY=sk-...
COPILOTKIT_API_KEY=...
```

## 🔌 API Endpoints

- **Backend Docs**: http://localhost:8000/docs
- **MLflow UI**: http://localhost:5000
- **MinIO Console**: http://localhost:9001 (user/password: minioadmin)

## 🧩 Extension Points (AG-UI / A2UI)

- **AG-UI**: event schema used in `backend/app/services/forecasting.py` and `frontend/app/page.tsx` to drive UI state.
- **A2UI**: Actions buttons in the dashboard are placeholders for where the action registry would map LLM intents to UI.
- **MCP**: Node.js server at `http://localhost:3001` exposes `run_forecast` and `explain_chart` tools.

## 📁 Project Structure

- `frontend/`: Next.js application.
- `backend/`: FastAPI application.
- `mcp/`: Model Context Protocol server.
- `infra/`: Infrastructure config (if any, separate from compose).

---
