# MERN Investment Platform Test

This project implements the tasks from `Mern Dev Tech.Test.pdf`:

- MongoDB/Mongoose schemas for users, investments, referrals/level income, and ROI history.
- Secure JWT APIs for registration/login, investments, dashboard summaries, and referral trees.
- Idempotent daily ROI and referral-level income calculation.
- A React dashboard that fetches API data and renders totals, charts, tables, loading states, and a nested referral tree.
- A `node-cron` scheduler that runs the ROI process daily at midnight.

## Quick Start

```powershell
npm.cmd install
npm.cmd run install:all
Copy-Item server\.env.example server\.env
npm.cmd run dev
```

Update `server/.env` with your MongoDB URI and JWT secret before using real data.

## API Summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/investments`
- `GET /api/dashboard`
- `GET /api/referrals/tree`
- `POST /api/admin/run-daily-roi` for manually testing the daily job

All non-auth endpoints require `Authorization: Bearer <token>`.
