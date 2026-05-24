# MeetMind

Enterprise AI Meeting Intelligence Platform

MeetMind is a production-style AI-powered meeting intelligence system designed to automate meeting workflows, transcript management, and AI-driven insights for teams and organizations.

The project is being built incrementally using scalable backend architecture, modern AI engineering practices, and real-world SaaS development workflows.

---

# Vision

MeetMind aims to evolve into an autonomous AI operations assistant capable of:

* Processing meeting transcripts automatically
* Generating AI summaries and action items
* Extracting decisions and follow-ups
* Managing organizational knowledge
* Integrating with Gmail, Slack, Calendar, and Zoom
* Building searchable AI memory using RAG pipelines
* Supporting multi-agent AI workflows

---

# Current Progress

## ✅ Milestone 1 — Backend Foundation

Implemented:

* FastAPI backend architecture
* PostgreSQL database integration
* JWT authentication system
* User registration/login APIs
* Protected routes
* SQLAlchemy ORM
* Alembic migrations
* Swagger/OpenAPI documentation
* Service-layer architecture

---

## ✅ Milestone 2 — Meeting Management System

Implemented:

* Meeting CRUD APIs
* User-owned meetings
* Transcript upload system
* File handling infrastructure
* Protected meeting routes
* SQLAlchemy relationships
* Transcript storage and retrieval
* Database migrations for meetings

---

# Tech Stack

## Backend

* FastAPI
* PostgreSQL
* SQLAlchemy
* Alembic
* JWT Authentication
* Python

## AI & Infrastructure (Planned)

* OpenAI API
* LangChain
* Vector Database
* RAG Pipelines
* Multi-Agent Systems
* Redis
* Docker

## Frontend (Planned)

* React
* TailwindCSS

---

# Architecture

```text
Frontend (Planned)
        ↓
FastAPI Backend
        ↓
Authentication + Services
        ↓
Meeting & Transcript APIs
        ↓
PostgreSQL Database
```

---

# Features Implemented

## Authentication

* User Registration
* User Login
* JWT Access Tokens
* Protected Routes
* Password Hashing

## Meeting Management

* Create Meetings
* Fetch Meetings
* Update Meetings
* Delete Meetings
* Upload Transcript Files
* Retrieve Stored Transcripts

---

# API Documentation

Swagger/OpenAPI Docs:

```text
http://127.0.0.1:8000/docs
```

---

# Run Locally

## Backend

```bash
uvicorn app.main:app --reload
```

---

# Project Structure

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── alembic/
├── uploads/
├── requirements.txt
└── .env.example
```

---

# Upcoming Milestones

## 🔜 Milestone 3 — AI Processing Engine

* GPT-powered meeting summaries
* Action item extraction
* Decision extraction
* Structured AI outputs

## 🔜 Milestone 4 — Frontend Dashboard

* Authentication UI
* Meeting dashboard
* Transcript management
* AI insights display

## 🔜 Milestone 5 — RAG + AI Memory

* Vector database integration
* Semantic search
* Organizational memory
* Context-aware AI responses

## 🔜 Milestone 6 — Enterprise Integrations

* Gmail integration
* Slack integration
* Google Calendar integration
* Zoom transcript ingestion

---

# Engineering Goals

This project focuses on learning and implementing:

* Production backend architecture
* AI application engineering
* Database design
* Authentication systems
* API development
* Scalable SaaS workflows
* Retrieval-Augmented Generation (RAG)
* Multi-agent orchestration systems

---

# Status

🚧 Active Development
