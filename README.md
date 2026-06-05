## MERN Investment Platform

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) investment management platform developed to demonstrate modern web application development practices, secure authentication, financial data management, and referral-based reward systems.

# Features
- MongoDB/Mongoose schemas for users, investments, referrals, level income, and ROI history.
- Secure JWT-based authentication and authorization.
- Investment management APIs.
- Dashboard APIs for investment summaries, ROI earnings, and referral income tracking.
- Multi-level referral tree management and visualization.
- Automated daily ROI and referral income calculations.
- React-based dashboard with charts, tables, statistics, and loading states.
- Nested referral tree display for network tracking.
- Scheduled background processing using node-cron.

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
