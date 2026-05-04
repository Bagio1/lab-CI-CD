# Smart Task & Deadline Manager API

A production-ready REST API for managing tasks and deadlines, built with **Node.js + Express + TypeScript + PostgreSQL (Prisma)**.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Running with Docker](#running-with-docker)
- [API Endpoints](#api-endpoints)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)

---

## Features

- Full CRUD for tasks
- Filter tasks by status (`pending`, `in_progress`, `completed`)
- Automatic overdue task detection
- Task statistics per user (total / completed / pending / overdue)
- Input validation on every endpoint
- Centralised error handling
- 50 %+ test coverage enforced by Jest coverage thresholds

---

## Project Structure

```
smart-task-api/
├── prisma/
│   └── schema.prisma          # Database models (User, Task)
├── src/
│   ├── app.ts                 # Express app factory
│   ├── server.ts              # HTTP server entry point
│   ├── database/
│   │   └── prisma.ts          # Prisma singleton
│   ├── types/
│   │   └── index.ts           # Shared DTOs and types
│   ├── validators/
│   │   └── task.validator.ts  # express-validator chains
│   ├── services/
│   │   └── task.service.ts    # Business logic
│   ├── controllers/
│   │   └── task.controller.ts # HTTP handlers
│   ├── routes/
│   │   └── task.routes.ts     # Route definitions
│   └── middleware/
│       └── error.middleware.ts # Central error handler
├── tests/
│   ├── unit/
│   │   ├── task.service.test.ts
│   │   └── task.validator.test.ts
│   └── integration/
│       └── task.api.test.ts
├── .env.example
├── .eslintrc.json
├── .gitlab-ci.yml
├── Dockerfile
├── docker-compose.yml
├── jest.config.ts
├── tsconfig.json
└── tsconfig.build.json
```

---

## Setup Instructions

### Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14 (or Docker)

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL
```

### 3. Run database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Running Tests

### All tests with coverage

```bash
npm test
```

Coverage report is written to `coverage/`. The pipeline (and local run) **fails automatically** if any metric drops below 50 %.

### Unit tests only

```bash
npm run test:unit
```

### Integration tests only

```bash
npm run test:integration
```

---

## Running with Docker

### Build and start (production mode)

```bash
docker compose up --build
```

This starts:
- `api` – the Node.js application on port 3000
- `db` – PostgreSQL on port 5432

### Build image manually

```bash
docker build -t smart-task-api:local .
```

### Run the container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/smart_tasks" \
  smart-task-api:local
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/tasks` | Create a task |
| `GET`  | `/api/tasks/:id` | Get task by ID |
| `PUT`  | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET`  | `/api/tasks/user/:userId` | Get user's tasks (optional `?status=` filter) |
| `GET`  | `/api/tasks/user/:userId/overdue` | Get overdue tasks |
| `GET`  | `/api/tasks/user/:userId/stats` | Get task statistics |

### Task body example

```json
{
  "title": "Write report",
  "description": "Q1 financial report",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-06-30T23:59:00Z",
  "userId": "00000000-0000-0000-0000-000000000001"
}
```

### Stats response example

```json
{
  "total": 10,
  "completed": 4,
  "pending": 5,
  "overdue": 1
}
```

---

## CI/CD Pipeline

The GitLab pipeline (`.gitlab-ci.yml`) runs on every push and merge request.

```
build → lint → test → docker-build → docker-push
```

| Stage | What it does | Fails when |
|-------|-------------|------------|
| **build** | `npm ci` + `tsc` | TypeScript compile error |
| **lint** | `eslint "src/**/*.ts"` | Any ESLint error |
| **test** | `jest --coverage` | Test failure or coverage < 50 % |
| **docker-build** | `docker build` tagged with `$CI_COMMIT_SHORT_SHA` | Build error |
| **docker-push** | Push to Docker Hub (main branch + MRs only) | Auth failure |
