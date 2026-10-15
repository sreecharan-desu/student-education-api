# Student Education Mobile App — Dashboard Backend API
**Andhra Pradesh State Board (SCERT AP) | Academic Year 2026–2027**

Production-oriented, in-house local backend built from scratch for the Student Education Mobile Application (React Native / Expo).

---

## 🚀 Technology Stack

- **Framework:** [NestJS](https://nestjs.com/) (Modular architecture)
- **HTTP Adapter:** [Fastify](https://www.fastify.io/) (`@nestjs/platform-fastify`)
- **Language:** TypeScript (Strict mode)
- **Database:** Local PostgreSQL (`student_education_db`) — *100% in-house, zero cloud dependencies*
- **Database GUI:** pgAdmin 4
- **ORM:** [Prisma ORM 6](https://www.prisma.io/)
- **API Documentation:** Swagger / OpenAPI (`/api/docs`)
- **Authentication:** JWT (Stateless Bearer Tokens) with `bcryptjs` password hashing
- **Security:** Helmet, Throttler (Rate Limiting), Parameterized queries, Strict CORS, Non-whitelisted DTO stripping
- **Validation:** `class-validator` & `class-transformer`
- **Configuration:** `@nestjs/config` with typed environment validation

---

## 📋 Table of Contents

1. [Local PostgreSQL & pgAdmin 4 Setup Guide](#1-local-postgresql--pgadmin-4-setup-guide)
2. [Environment Configuration](#2-environment-configuration)
3. [Database Migrations & Seeding](#3-database-migrations--seeding)
4. [Running the Application](#4-running-the-application)
5. [Connecting React Native / Expo Over Local Wi-Fi](#5-connecting-react-native--expo-over-local-wi-fi)
6. [Swagger API Documentation](#6-swagger-api-documentation)
7. [API Endpoints Overview](#7-api-endpoints-overview)
8. [Automated Testing](#8-automated-testing)
9. [Project Architecture](#9-project-architecture)
10. [Completed Features & Scope Boundary](#10-completed-features--scope-boundary)

---

## 1. Local PostgreSQL & pgAdmin 4 Setup Guide

### A. Starting PostgreSQL Locally
Ensure your local PostgreSQL server is running on port `5432`.
If running via Docker/Colima or a local installation:
```bash
# Verify PostgreSQL is accepting connections on localhost:5432
psql -h 127.0.0.1 -p 5432 -U vidya -d postgres
```

### B. Connecting in pgAdmin 4
1. Open **pgAdmin 4**.
2. Right-click on **Servers** > **Register** > **Server...**.
3. Under the **General** tab:
   - **Name:** `Local Postgres`
4. Under the **Connection** tab:
   - **Host name/address:** `localhost` or `127.0.0.1`
   - **Port:** `5432`
   - **Maintenance database:** `postgres`
   - **Username:** `vidya` (or your local postgres superuser)
   - **Password:** `vidya` (check "Save password")
5. Click **Save**.

### C. Creating `student_education_db` in pgAdmin 4
1. In the Object Explorer, expand `Local Postgres`.
2. Right-click on **Databases** > **Create** > **Database...**.
3. **Database:** `student_education_db`
4. **Owner:** `vidya` (or `app_user`)
5. Click **Save**.

### D. Optional: Creating Dedicated `app_user` Role
Open **Tools** > **Query Tool** inside `student_education_db` and execute:
```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user WITH LOGIN PASSWORD 'YOUR_PASSWORD';
  END IF;
  GRANT ALL PRIVILEGES ON DATABASE student_education_db TO app_user;
  GRANT ALL ON SCHEMA public TO app_user;
END $$;
```

---

## 2. Environment Configuration

Copy the example environment file and adjust credentials:

```bash
cp .env.example .env
```

`.env` contents:
```env
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Database Connection (Local PostgreSQL - In-House Only)
DATABASE_URL="postgresql://vidya:vidya@127.0.0.1:5432/student_education_db?schema=public"

# Authentication Security
JWT_SECRET=super_secret_jwt_key_local_dev_andhra_pradesh_2026_2027
JWT_EXPIRES_IN=15m

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=30
```

> **Note on Port:** Default is set to `3001` so it does not conflict with existing processes on port 3000. You can change `PORT=3000` whenever port 3000 is free.

---

## 3. Database Migrations & Seeding

### Generate Prisma Client
```bash
npx prisma generate
```

### Apply Migrations
```bash
npx prisma migrate dev --name init_student_dashboard_schema
```

### Execute Seed Data
```bash
npx prisma db seed
# or
npm run seed
```

### Seed Accounts Available
| Account Type | Email | Password | Details |
|---|---|---|---|
| **Demo Student** | `student@vidya.local` | `Student@2026!` | Aditya Varma, Class 8, AP State Board, English Medium |
| **Peer Student** | `sita.r@vidya.local` | `Student@2026!` | Sita Ramulu, Class 8, AP State Board (for data isolation testing) |

---

## 4. Running the Application

### Development Mode (with hot-reload)
```bash
npm run start:dev
```

### Production Build & Run
```bash
npm run build
npm run start:prod
```

When started, the backend binds to `0.0.0.0`, allowing access from both localhost and local devices on the same Wi-Fi.

---

## 5. Connecting React Native / Expo Over Local Wi-Fi

A physical Android or iOS device cannot access the computer via `localhost`. You must use your computer's local network IP.

### Step 1: Find your Computer's Local IP Address
On macOS:
```bash
ipconfig getifaddr en0
# Example output: 192.168.0.126
```

### Step 2: Configure Expo / React Native App
In your mobile application's config (e.g. `.env` or `api/client.ts`):

```typescript
// Replace with your Mac's current Wi-Fi IP address
export const API_BASE_URL = 'http://192.168.0.126:3001/api/v1';

// For Android Emulator (if testing on virtual device)
// export const API_BASE_URL = 'http://10.0.2.2:3001/api/v1';

// For iOS Simulator (if testing on Mac)
// export const API_BASE_URL = 'http://localhost:3001/api/v1';
```

### Step 3: Verify Mobile Connectivity
Open Safari or Chrome on your mobile phone connected to the **same Wi-Fi** and navigate to:
```text
http://192.168.0.126:3001/api/v1/health
```
You should see:
```json
{
  "status": "ok",
  "service": "student-education-api",
  "database": "connected"
}
```

---

## 6. Swagger API Documentation

Interactive Swagger OpenAPI docs are available at:
```text
http://localhost:3001/api/docs
```
Or from your LAN:
```text
http://192.168.0.126:3001/api/docs
```

Features:
- Bearer JWT token authorization with persistent session
- Interactive testing of all endpoints
- Full response and request schemas

---

## 7. API Endpoints Overview

All routes are prefixed with `/api/v1`.

### A. Health Check
- `GET /api/v1/health` (Public)
  - Returns service status and safe database connection indicator.

### B. Authentication
- `POST /api/v1/auth/login` (Public, Rate Limited: 20 req/min)
  - Body: `{ "email": "student@vidya.local", "password": "Student@2026!" }`
  - Returns: `{ "accessToken": "...", "expiresIn": "15m", "student": { ... } }`
- `GET /api/v1/auth/me` (Protected)
  - Returns authenticated student profile derived from JWT.
- `POST /api/v1/auth/logout` (Protected)

### C. Student Dashboard
- `GET /api/v1/dashboard` (Protected)
  - Aggregated payload for instant dashboard render in a single HTTP request:
    - `student`: profile summary
    - `tasks`: top urgent tasks
    - `continueLearning`: most recently accessed eligible learning item with progress (or `null`)
    - `subjects`: curriculum subjects with progress percentages
    - `progress`: completed lessons, tasks, average quiz score, 7-day weekly activity
    - `announcements`: recent published announcements
    - `quickActions`: bookmarks count
- `GET /api/v1/dashboard/tasks` (Protected)
  - Query params: `period=today|upcoming|all`, `status=pending|in_progress|completed|overdue`, `limit`, `cursor`.
  - Dynamic overdue derivation against `dueAt`. Incomplete urgent tasks sorted first.
- `GET /api/v1/dashboard/subjects` (Protected)
  - Returns subjects for authenticated student's `classLevel`, `board`, and `academicYear`.
  - Computes `completedItems`, `totalItems`, and `progressPercent`.
- `GET /api/v1/dashboard/continue-learning` (Protected)
  - Returns most recently accessed eligible learning item to resume study.
- `GET /api/v1/dashboard/progress` (Protected)
  - Metrics: completed lessons count, completed tasks count, average quiz score, weekly activity breakdown.
- `GET /api/v1/dashboard/announcements` (Protected)
  - Query params: `limit` (max 50).
  - Returns announcements applicable to student's class and school-wide, with `isRead` and `readAt`.
- `PATCH /api/v1/announcements/:id/read` (Protected)
  - Idempotent mark-as-read for authenticated student.
- `GET /api/v1/dashboard/bookmarks` (Protected)
  - Query params: `limit`, `cursor`.
  - Bounded preview and total count. Strict student isolation.

---

## 8. Automated Testing

The project includes unit tests for business logic and end-to-end (E2E) integration tests against the local database.

```bash
# Run unit tests
npm run test

# Run E2E integration tests
npm run test:e2e

# Run all tests with coverage
npm run test:cov
```

### Test Coverage Highlights:
- ✅ Health check verification & safe DB status
- ✅ Valid login returning JWT access token & sanitized profile
- ✅ Invalid credentials returning generic errors (no email enumeration)
- ✅ Token absence & unauthorized rejection
- ✅ Aggregated dashboard response completeness
- ✅ Subject curriculum isolation (Class 8 vs Class 7)
- ✅ Dynamic task overdue derivation & period filtering
- ✅ Continue-learning resumption logic
- ✅ Progress calculations (lessons, tasks, quiz scores, weekly activity)
- ✅ Announcement audience filtering (Class 8 vs Class 10 isolation)
- ✅ Idempotent announcement read marking
- ✅ Cross-student data isolation (Student A cannot access Student B's bookmarks or records)
- ✅ Query parameter DTO validation & bad request rejection

---

## 9. Project Architecture

```text
student-education-api/
├── prisma/
│   ├── schema.prisma           # 9 Prisma models with UUID PKs, enums, & indexes
│   ├── migrations/             # Applied schema migrations
│   └── seed.ts                 # Idempotent SCERT AP Classes 7 & 8 seed data
├── src/
│   ├── main.ts                 # Fastify bootstrap, CORS, Helmet, Swagger, 0.0.0.0
│   ├── app.module.ts           # Root module with global guards, filters, interceptors
│   ├── common/
│   │   ├── decorators/         # @Public(), @CurrentUser()
│   │   ├── filters/            # Global HttpExceptionFilter
│   │   ├── guards/             # JwtAuthGuard
│   │   └── interceptors/       # LoggingInterceptor (sensitive data redacted)
│   ├── config/                 # App configuration & env loader
│   ├── prisma/                 # PrismaService & PrismaModule
│   ├── auth/                   # JWT auth, bcryptjs, login & logout
│   ├── students/               # Student profile service
│   ├── subjects/               # Curriculum subjects & progress calculations
│   ├── tasks/                  # Task query filtering, overdue derivation & sorting
│   ├── learning/               # Continue-learning resume item service
│   ├── progress/               # Completion analytics & 7-day weekly activity
│   ├── announcements/          # Audience-filtered announcements & idempotent read
│   ├── bookmarks/              # Bookmarks preview & student isolation
│   ├── dashboard/              # Aggregated dashboard orchestrator & controllers
│   └── health/                 # Health check endpoint
├── test/
│   ├── jest-e2e.json           # Jest E2E configuration
│   └── dashboard.e2e-spec.ts   # 19 comprehensive E2E tests
├── .env                        # Local development variables (git ignored)
├── .env.example                # Placeholder template
├── package.json
└── tsconfig.json
```

---

## 10. Completed Features & Scope Boundary

### Completed in this Phase:
- Complete NestJS + Fastify REST API architecture.
- Full relational schema in PostgreSQL via Prisma migrations.
- Demo seed data for SCERT Andhra Pradesh (English Medium, Class 8 & Class 7, Academic Year 2026–2027).
- Full Student Dashboard aggregated endpoint and modular endpoints.
- Secure JWT authentication with bcrypt password hashing and generic error responses.
- Dynamic task overdue evaluation and urgency sorting.
- Idempotent announcement read tracking.
- Bounded bookmark preview and counts.
- Cross-student data security (identity derived exclusively from validated JWT).
- Swagger OpenAPI interactive documentation.
- 35 automated tests (16 unit + 19 E2E) passing 100%.

### Planned Future Modules (Explicitly Out of Current Scope):
- Teacher / Faculty portal and administration panel.
- Full chapter-content delivery engine (video streaming, PDF readers, interactive content).
- Quiz evaluation engine with question banks and live timed submissions.
- Assignment submission file uploads.
- Payment gateways and subscription management.
