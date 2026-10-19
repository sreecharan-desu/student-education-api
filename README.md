# student-education-api

rest api for the ap scert class 6-10 student learning app (react native / expo).

## features

- jwt auth with bcrypt hashing and rate-limited login
- one aggregated dashboard call: profile, urgent tasks, continue learning, subject progress, weekly activity, announcements, bookmarks count
- modular endpoints for tasks (with overdue status computed from due date), subjects, progress, announcements (idempotent mark-as-read) and bookmarks
- student identity comes only from the jwt, so one student can't read another's data
- swagger at `/api/docs`, all routes under `/api/v1`

## stack

nestjs on fastify · typescript · prisma 6 · postgres · helmet + throttler · class-validator · jest

## run locally

needs node, docker (for the `vidya-postgres` container) or a local postgres on 5432.

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed
npm run dev              # starts postgres if stopped, prisma generate, hot reload
npm run build && npm run start:prod
```

seed logins: `student@vidya.local` / `Student@2026!` and `sita.r@vidya.local` / `Student@2026!`.

tests: `npm test` and `npm run test:e2e`.

## env

copy `.env.example` to `.env`.

## known issues

- `npm run build` needs `DATABASE_URL` set (prisma generate).
- jest needs the esm transform fixed before the suites run cleanly.
