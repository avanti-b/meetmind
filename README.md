# MeetMind

Enterprise AI Meeting Intelligence Platform

MeetMind is a production-style AI-powered meeting intelligence system designed to automate meeting workflows, transcript management, and AI-driven insights.

This project is being built incrementally using scalable backend architecture and modern AI engineering practices.

---

# Current Progress

## ✅ Milestone 1 — Backend Foundation

Implemented:
- FastAPI backend architecture
- JWT Authentication
- PostgreSQL integration
- SQLAlchemy ORM
- Alembic migrations
- Protected routes
- Swagger/OpenAPI documentation
- Service-layer architecture

---

# Tech Stack

## Backend
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT Authentication
- Python

## Planned
- React Frontend
- OpenAI Integration
- Vector Database
- RAG Pipelines
- Multi-Agent Workflows

---

# Architecture

```text
Frontend (Coming Soon)
        ↓
FastAPI Backend
        ↓
Authentication + Services
        ↓
PostgreSQL Database
```

---

# Run Locally

```bash
uvicorn app.main:app --reload
```

Swagger Docs:
```text
http://127.0.0.1:8000/docs
```

---

# Upcoming Features

- Meeting Management APIs
- Transcript Upload System
- AI Meeting Summaries
- Action Item Extraction
- Semantic Search
- Multi-Agent AI Workflows