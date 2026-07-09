# AI SOC Analyst

**Version 1.0 (Stable)**

An open-source AI-powered security operations platform that ingests security logs, detects common attack patterns, generates structured investigation reports, and surfaces findings through a professional SOC dashboard. Designed for security engineers, SOC analysts, and teams evaluating AI-assisted threat detection.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Local Installation](#local-installation)
- [Deployment](#deployment)
- [Engineering Decisions](#engineering-decisions)
- [Current Limitations](#current-limitations)
- [Version Roadmap](#version-roadmap)
- [Lessons Learned](#lessons-learned)
- [Project Summary](#project-summary)
- [License](#license)

---

## Introduction

Security teams triage hundreds of authentication logs daily. AI SOC Analyst automates the first pass: it parses raw log files, runs deterministic correlation rules against parsed events, and produces structured investigation reports with evidence and recommendations.

The system does not replace an analyst. It handles the repetitive work of log parsing, pattern matching, and report drafting so that analysts can focus on response.

Version 1.0 supports three log formats, four detection rules, a LangGraph orchestration pipeline, template-based and Gemini-powered report generation, and a React frontend with a dashboard and investigation workspace. All analysis history is persisted in the browser.

---

## Features

### Detection Engine

- **Log parsing**: Windows Security Event logs (4624, 4625, 4672), Linux auth.log (sshd), and structured CSV files. Auto-detection selects the correct parser based on content heuristics.
- **Correlation rules**: Brute Force (5+ failed logins followed by success), Password Spraying (5+ unique users from a single IP within a configurable time window, MITRE T1110.003), Privilege Escalation (login immediately followed by privilege grant), and Data Exfiltration (login, file access, then large download).
- **Rule-based processing**: Rules operate on parsed SecurityEvent objects with deterministic thresholds. No ML inference is involved in detection.
- **LangGraph workflow**: Four-node directed graph (parse, correlate, investigate, report) with typed state passed between nodes.

### AI Investigation

- **Report generation**: Two generators — a template engine that builds structured reports from finding metadata, and a Gemini-powered generator (2.0 Flash) that produces narrative summaries, evidence lists, and recommendations.
- **Graceful fallback**: If Gemini API calls fail (network, quota, invalid response), the system falls back to the template generator. No investigation is lost.
- **Investigation reports**: Each report includes a title, severity, summary, evidence items, and actionable recommendations.

### Investigation Workspace

- **Sidebar explorer**: Search and filter incidents by severity. Click to select.
- **Incident detail panel**: Summary, detection reasoning, timeline, MITRE ATT&CK card, evidence viewer, and recommendation cards.
- **Timeline**: Step-by-step reconstruction of the detection logic. A disclaimer notes that the backend does not return raw event timestamps, so the timeline reflects detection order, not chronological sequence.
- **MITRE mapping**: Local mapping from detection rule names to MITRE ATT&CK technique IDs (T1110, T1110.003, T1068, T1048).

### Dashboard

- **Threat overview**: Counts for files analyzed, total findings, critical, high, and medium/low severity. Percentages of total displayed for severity breakdowns.
- **Threat score**: Weighted calculation based on severity distribution, finding volume, and attack-type diversity. Displayed as an SVG ring gauge.
- **Attack distribution**: Donut chart showing the proportion of each detection type across all analyses.
- **Attack trends**: Area chart showing detection volume over time, derived from analysis timestamps.
- **Intelligence panels**: Top source IPs and most targeted users, aggregated across all stored analyses.
- **Recent investigations**: Sortable table with filename, timestamp, finding count, highest severity, attack types, and status.
- **System status**: Live indicators for backend connectivity, AI engine availability, active detection rules, and theme.

### Analysis History

- **Browser localStorage**: All analysis results are persisted automatically after each successful analysis. Up to 20 analyses are retained, newest first.
- **History recall**: Click any analysis in the Recent Investigations table to reopen the workspace exactly as it appeared after the original analysis.
- **Dashboard aggregation**: All dashboard metrics are derived from the full history collection. No fabricated or sample data is displayed.

### User Interface

- **Dark and light themes**: Persisted to localStorage, toggled from the navigation bar.
- **Responsive layout**: Three-panel investigation workspace adapts to screen width. Dashboard grid collapses from 5 columns on large screens to single-column on mobile.

---

## System Architecture

```
User
  |
  v
React Frontend (Vite + React Router)
  |
  |  POST /analyze (multipart file upload)
  v
FastAPI Backend (Uvicorn)
  |
  v
LangGraph Workflow (4 sequential nodes)
  |
  +--> parse_logs            LogParserAgent
  |       |
  |       +-- CSV parser
  |       +-- Linux auth.log parser
  |       +-- Windows Security Log parser
  |
  +--> correlate_events      CorrelationAgent
  |       |
  |       +-- Brute Force Rule
  |       +-- Password Spraying Rule
  |       +-- Privilege Escalation Rule
  |       +-- Data Exfiltration Rule
  |
  +--> investigate_findings  InvestigationAgent
  |       |
  |       +-- TemplateReportGenerator
  |       +-- GeminiReportGenerator (fallback chain)
  |
  +--> generate_reports      Validation + aggregation
  |
  v
AnalyzeResponse (JSON)
  |
  v
React Frontend (Dashboard + Workspace)
```

**Frontend layer**: Single-page application built with Vite and React 18, routed with React Router. The Dashboard aggregates metrics from localStorage-backed analysis history. The Workspace presents a three-panel layout for incident triage. The Analyze page handles file upload with drag-and-drop.

**API layer**: FastAPI exposes two endpoints — `GET /health` for status checks and `POST /analyze` for log file submission. File validation occurs in the service layer before the LangGraph workflow is invoked.

**Workflow layer**: LangGraph orchestrates four typed nodes in sequence. Each node receives the previous node's outputs through a shared `SOCWorkflowState` dictionary. The workflow is rebuilt on every request with injected dependencies (parser, correlator, investigator), which makes testing and customization straightforward.

**Agent layer**: Log parser auto-detects format from content (first 10 lines scanned for signatures), then delegates to the specialized parser. Correlation agent runs all rules against the sorted event list. Investigation agent selects between Gemini and template generators based on environment configuration.

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.6 | Type safety |
| Vite | 5.4 | Build tool and dev server |
| React Router | 6.28 | Client-side routing |
| Recharts | 3.9 | Charts (pie, area) |
| Lucide React | 1.24 | Icons |
| Tailwind CSS | 3.4 | Utility-first styling |
| shadcn-style components | — | Button, Card, Badge, Skeleton primitives |

### Backend

| Library | Version | Purpose |
|---|---|---|
| Python | 3.12+ | Runtime |
| FastAPI | 0.115 | REST API framework |
| Uvicorn | 0.32 | ASGI server |
| LangGraph | 0.2 | Workflow orchestration |
| Pydantic | 2.0 | Data validation and schemas |
| python-multipart | 0.0.12 | File upload handling |
| pytest | 8.0 | Test framework |

### AI

| Service | Purpose |
|---|---|
| Google Gemini 2.0 Flash | Report generation (optional, requires API key) |
| Template engine | Report generation (default, no API key required) |

### Deployment

| Tool | Purpose |
|---|---|
| Vercel | Frontend hosting (manual setup) |
| Render | Backend hosting (manual setup) |
| Environment variables | `GEMINI_API_KEY`, `VITE_API_BASE_URL` |

---

## Project Structure

```
ai-soc-analyst/
  backend/
    app/
      api/v1/router.py        GET /health, POST /analyze
      schemas/                 Pydantic models (SecurityEvent, SecurityFinding, InvestigationReport, AnalyzeResponse)
      services/                File validation, workflow invocation
    agents/
      graphs/                  LangGraph state, nodes, workflow builder, runner
      log_parsers/             CSV, Linux auth.log, Windows Security log parsers + auto-detection
      rules/                   BruteForce, PasswordSpraying, PrivilegeEscalation, DataExfiltration
      report_generators/       Template-based + Gemini-powered report generation
      correlation_agent.py     Runs detection rules against parsed events
      investigation_agent.py   Generates reports for each finding
    tests/                     API, agent, parser, rule, and workflow tests

  frontend/
    src/
      components/
        dashboard/             StatCard, ThreatScoreCard, AttackTrendsChart, TopSourceIPs, TopTargetedUsers, RecentInvestigations, QuickActions, SystemStatus
        workspace/             IncidentExplorer, IncidentDetail, IncidentTimeline, EvidenceCard, MitreCard, RecommendationCard, CopilotPlaceholder
        ui/                    Button, Card, Badge, Skeleton (shadcn-style)
      context/                 AnalysisContext, ThemeContext, ToastContext
      hooks/                   useAnalysisHistory
      lib/                     aggregation.ts, persistence.ts, utils.ts
      pages/                   DashboardPage, AnalyzePage, WorkspacePage
      services/api.ts          analyzeLogFile() — POST /analyze
      types/api.ts             TypeScript interfaces for all API types

  data/samples/                11 attack scenario files across 3 log formats
```

---

## Screenshots

### Dashboard

The main dashboard displays a system status bar, a threat overview row (5 stat cards), an analytics row (threat score gauge, attack trends area chart, attack distribution donut chart), an intelligence row (top source IPs, targeted users, quick actions), and the recent investigations table. All metrics are derived from locally stored analysis history.

### Investigation Workspace

A three-panel layout: left sidebar lists incidents with search and severity filtering, center panel shows the full incident detail (summary, detection reasoning, timeline, MITRE card, incident details, evidence, recommendations), and the right panel is reserved for the AI Copilot (planned for Version 2).

### Timeline

The incident timeline displays detection steps with expandable detail. Each step shows its severity and detection type. A disclaimer at the top of the timeline notes that the backend does not provide raw event timestamps, so the timeline reflects detection logic order rather than chronological sequence.

### AI Investigation Report

When a Gemini API key is configured, the backend generates investigation reports with narrative summaries, structured evidence, and actionable recommendations. If the Gemini API is unavailable, the template generator produces equivalent reports using finding metadata. The frontend displays both types identically.

---

## Local Installation

### Prerequisites

- Python 3.12 or later
- Node.js 18 or later
- npm 9 or later

### Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend starts at `http://127.0.0.1:8000`. Verify with:

```bash
curl http://127.0.0.1:8000/health
# {"status": "ok"}
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server starts at `http://localhost:5173`. The Vite dev server proxies `/analyze` and `/health` requests to the backend.

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | No | — | Enables Gemini-powered report generation. Without it, the template engine is used. |
| `VITE_API_BASE_URL` | No | `""` (uses Vite proxy) | Backend URL for production frontend builds. |

To use Gemini reports, create a `.env` file in the `backend/` directory:

```
GEMINI_API_KEY=your_api_key_here
```

### Running Tests

```bash
cd backend
pytest -v
```

The test suite covers all parsers, detection rules, report generators, API endpoints, and the full LangGraph workflow integration.

---

## Deployment

The frontend is built with Vite and can be deployed to any static hosting provider. The backend is a FastAPI application that requires a Python runtime.

### Frontend

```bash
cd frontend
npm run build
# Output: dist/
```

Deploy the `dist/` directory to a static host (Vercel, Netlify, Cloudflare Pages). Set `VITE_API_BASE_URL` to the backend's public URL.

### Backend

The backend runs as a Python process with Uvicorn. Deploy to any platform that supports Python web services (Render, Railway, Fly.io, or a virtual private server).

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Production Architecture

```
Browser  -->  Vite-built static assets (Vercel / CDN)
                |
                |  POST /analyze
                v
              FastAPI (Uvicorn workers)
                |
                |  (optional) Gemini API
                v
              Google Gemini
```

Both frontend and backend must be deployed separately. No database is required for Version 1.0 — all analysis history is stored in the browser.

---

## Engineering Decisions

### Why React and TypeScript

React was chosen for its ecosystem maturity and the availability of Recharts for charting. TypeScript was non-negotiable for a project with complex data flows (analysis results flowing from API through context to dashboard and workspace components). TypeScript catches structural mismatches between the backend's Pydantic schemas and the frontend's data display logic at compile time rather than runtime.

**Tradeoff**: React's re-render model required careful memoization (useMemo, useCallback) and a `setHistory` updater pattern to avoid losing state during navigation. A simpler framework like Svelte would have less boilerplate, but React's debugging tools and community resources outweighed this cost.

### Why FastAPI over Flask

FastAPI provides built-in Pydantic integration, which means the same schemas that validate API requests also serve as the OpenAPI specification. The `/docs` endpoint is auto-generated. Flask would require either manual schema work or a separate library like marshmallow.

**Tradeoff**: FastAPI's dependency injection system adds indirection. For a project with four agents and straightforward routes, Flask's simplicity would have sufficed. The decision was made anticipating more complex routes in future versions.

### Why LangGraph over Prompt Chaining

LangGraph provides typed state transitions, explicit node definitions, and a directed graph structure that mirrors the security analysis pipeline. Each node (parse, correlate, investigate, report) receives typed input and produces typed output. This makes testing individual nodes possible without running the full workflow.

**Tradeoff**: LangGraph 0.2 added approximately 2 MB to the deployment. For four sequential nodes, a simple Python function call chain would have worked. LangGraph was chosen because future versions will add branching paths (parallel detection rules, conditional report generation), where a graph-based approach becomes essential.

### Why Gemini (and why a fallback)

Gemini 2.0 Flash was selected because it supports structured JSON output natively through the `response_mime_type="application/json"` configuration. This eliminates the need for output parsing or regex extraction from free-form text. The template fallback ensures the system works without any API key, which is critical for local development and evaluation.

**Tradeoff**: Gemini introduces latency (typically 2-5 seconds per report), API costs, and network dependency. The template generator is instant but produces less varied output. The dual-generator architecture lets users choose: fast and predictable, or slower and more narrative.

### Why Tailwind CSS

Tailwind provides consistent design tokens (colors, spacing, typography) through a centralized configuration. For a project with dark/light themes and multiple dashboard panels, Tailwind's utility classes reduce the need for custom CSS and ensure theme changes propagate consistently.

**Tradeoff**: JSX files become verbose. A project with complex, unique layouts would benefit from semantic CSS. For this project's card-and-grid-heavy dashboard, Tailwind was a net positive.

### Why Recharts

Recharts provides declarative, composable chart components that integrate naturally with React's component model. The `ResponsiveContainer` wrapper handles responsive sizing without additional JavaScript.

**Tradeoff**: Recharts is larger than lightweight alternatives (roughly 200 KB minified). For three chart types (pie, area, bar), a lighter library would suffice. The tradeoff was accepted for development speed.

### Why LocalStorage (Version 1.0)

Analysis history is stored in the browser's localStorage for three reasons:

1. **Zero infrastructure**: No database setup, no schema migrations, no connection pooling. The application works immediately after cloning.
2. **Deterministic demo behavior**: Every deploy starts with a clean state. No stale test data from a shared database.
3. **Simplified deployment**: The frontend can be deployed as a static site without a backend database.

**Tradeoff**: localStorage is per-browser, not per-user. Clearing browser data destroys history. Data cannot be shared across devices or team members. This is the single largest architectural limitation of Version 1.0, and migrating to a backend database is the highest-priority item for Version 2.0.

The migration path is already designed: replace the function bodies in `src/lib/persistence.ts` with `fetch()` calls to a REST API. The data types (`AnalysisHistoryItem`) and React hooks remain unchanged.

---

## Current Limitations

| Limitation | Impact | Planned |
|---|---|---|
| Browser localStorage | History is per-browser, not per-user. Clearing browser data destroys history. | Database persistence (V2) |
| No authentication | Anyone with the URL can access the dashboard. | Auth integration (V2) |
| Batch analysis only | Logs must be uploaded as files. No streaming or live ingestion. | Live ingestion (V2) |
| 4 detection rules | Only Brute Force, Password Spraying, Privilege Escalation, and Data Exfiltration are implemented. | Additional rules (V2) |
| No MITRE ATT&CK in API response | MITRE mapping exists in the frontend (`mitreData.ts`) but is not returned by the backend. | Backend MITRE mapping (V2) |
| No IOC extraction | IPs and usernames are displayed but not extracted into a dedicated IOC panel. | IOC panel (V2) |
| No AI Copilot | The workspace's right panel is a placeholder. | Interactive copilot (V2) |
| No PDF export | Reports can be viewed but not exported. | Executive PDF reports (V2) |
| Investigation status hardcoded | The "Status" column in Recent Investigations always shows "open". | Status tracking (V2) |

---

## Version Roadmap

### Version 1.0 (Current)

- Three log format parsers (Windows Security, Linux auth.log, CSV)
- Four correlation rules (password spraying threshold is configurable; others use deterministic constants)
- LangGraph workflow with typed state
- Template-based report generation
- Gemini-powered report generation with automatic template fallback
- React frontend with Dashboard, Analyze, and Workspace pages
- Dashboard with threat overview, charts, intelligence panels, and history table
- Investigation workspace with incident detail, timeline, evidence, and MITRE cards
- Browser localStorage persistence for analysis history
- Dark and light themes
- Support for 11 sample attack scenarios across 3 log formats

### Version 2.0 (Planned)

- AI SOC Copilot (interactive Q&A in the workspace panel)
- MITRE ATT&CK mapping from the backend
- IOC extraction panel
- Executive PDF report export
- PostgreSQL persistence for cross-device history
- Authentication and session management
- Live log ingestion via WebSocket or agent
- Additional detection rules (lateral movement, ransomware indicators)
- Streaming real-time dashboard updates
- Investigation status tracking (open / investigated / resolved)

---

## Lessons Learned

### AI Integration

Gemini's structured JSON output works reliably when the prompt explicitly requests `response_mime_type="application/json"`. Without this flag, the model occasionally returns markdown-wrapped JSON. The fallback to template-based generation was critical during development when API quotas were exhausted.

### Prompt Engineering

The Gemini prompt includes the finding type, severity, description, affected user, and source IP. Initial prompts that omitted structured constraints produced verbose reports with irrelevant context. Adding explicit length guidance and format constraints improved consistency.

### Frontend Architecture

The three-panel investigation workspace (explorer, detail, placeholder) required careful state management. The selected incident index is local state in the workspace page, while analysis results live in a shared context. This separation prevents unnecessary re-renders when the dashboard updates.

### React State and Navigation

The most subtle bug in this project was caused by React 18's automatic batching: calling `setHistory` and `navigate` in the same synchronous handler caused the `useEffect` that persisted to localStorage to never fire, because the component unmounted before the effect cycle. The fix was to write to localStorage synchronously inside the state updater function, before React processes the batch.

### Deployment Dependencies

Python version compatibility across deployment platforms was a recurring issue. The `requirements.txt` does not pin Python, but LangGraph 0.2 requires Python 3.12+. Future versions should add a `.python-version` file.

### Testing Strategy

The pytest suite is organized by layer: parsers, rules, agents, API, and integration. The LangGraph workflow tests were the most valuable — they caught state mismatches between nodes that unit tests missed. The sample dataset tests (`test_sample_datasets.py`) validate that every attack scenario file produces the expected finding types, which is a useful regression check when modifying rules.

### Software Architecture

The dependency injection pattern for agents (log parser, correlation agent, investigation agent) made testing straightforward. Each test can inject a mock agent and verify the workflow handles it correctly. This was especially useful for testing the Gemini fallback behavior.

---

## Project Summary

- Built an open-source AI SOC platform that ingests Windows Security logs, Linux auth.log, and CSV files, and detects 4 attack types using deterministic correlation rules.
- Implemented a LangGraph workflow orchestrating 4 agents (parser, correlator, investigator, report generator) with typed state transitions.
- Built a dual report generation system: a Gemini 2.0 Flash integration with structured JSON output and a template-based fallback for zero-API-key operation.
- Developed a React dashboard with 10+ widgets (threat score gauge, attack trends area chart, attack distribution donut chart, top IPs, top users) all derived from browser-local analysis history.
- Engineered a three-panel investigation workspace with incident explorer, detail view, timeline, MITRE ATT&CK mapping, evidence, and recommendations components.
- Designed a modular persistence layer (localStorage in V1, migration path to PostgreSQL in V2) that decouples storage from business logic.
- Wrote 30+ unit, integration, and API tests covering parsers, rules, agents, workflow endpoints, and sample dataset validation.
- Researched and documented tradeoffs for 6 major technology decisions (React, FastAPI, LangGraph, Gemini, Tailwind, localStorage).

---

## License

MIT License. See [LICENSE](LICENSE) for details.

## Demo

https://ai-soc-analyst-blond.vercel.app/