# Academy Admin

React + TypeScript web portal for managing Rider Training Module content. Allows admins to manage training videos, quizzes, mandatory tracks, and view rider analytics.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- React Router (routing)
- Axios (HTTP client)

## Prerequisites

- Node.js 18+
- Backend: `academy-service` running (part of titan-backend)
- Auth: Shared auth-service (OTP-based login via `GET /auth/sendOtp/{number}`)

## Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start dev server
npm run dev
```

The app runs at `http://localhost:5173/`.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api-staging.staffpay.in` |

In development, Vite proxies `/api/*` requests to `VITE_API_BASE_URL` to avoid CORS issues. In production, the app calls `VITE_API_BASE_URL` directly.

## Authentication

Uses the shared Titan auth-service with OTP-based login:

1. `GET /auth/sendOtp/{phone}?source=desktop` — sends 4-digit OTP
2. `POST /auth/login` with `{ number, otp, referenceId, loginFrom: "desktop" }` — returns JWT token

The `desktop` source maps to admin users with `allow_desktop_login = TRUE` in the users database. Allowed roles: `ROLE_ADMIN` (2), `ROLE_ADMIN_READ_ONLY` (4), `ROLE_OPS_ADMIN` (8), `ROLE_SUPER_ADMIN` (9).

The JWT token is stored in `localStorage` and sent as an `authtoken` header on all API requests.

## Backend AWS Requirements

The academy-service uses AWS for video/thumbnail storage. See [`academy-service/README.md`](../titan-backend/DeliveryExecutiveWebApp/academy-service/README.md) for full setup.

**Summary:**

| Resource | Purpose | Required For |
|----------|---------|-------------|
| **S3 Bucket** (`titan-academy-videos`) | Video & thumbnail storage | Uploading video files |
| **CloudFront Distribution** | CDN for video delivery | Playing videos in rider app |
| **IAM Credentials** | S3 access | Upload/delete operations |

AWS is **not required** for: listing videos, creating metadata, quiz management, analytics, or any database-only operations.

**Environment variables** (set on the academy-service deployment):

```
AWS_S3_BUCKET_NAME=titan-academy-videos
AWS_REGION=ap-south-1
AWS_CLOUDFRONT_DOMAIN=<your-distribution>.cloudfront.net
AWS_ACCESS_KEY_ID=<key>           # or use IAM instance role
AWS_SECRET_ACCESS_KEY=<secret>    # or use IAM instance role
```

## Project Structure

```
src/
  api/           # Axios API clients (auth, videos, quiz, analytics)
  components/    # Shared components (ProtectedRoute, Layout)
  contexts/      # React contexts (AuthContext)
  pages/         # Page components
    LoginPage.tsx
    DashboardPage.tsx
    videos/      # Video CRUD pages
    quiz/        # Quiz builder
    tracks/      # Mandatory track editor
    analytics/   # Analytics dashboard
  types/         # TypeScript type definitions
```

## Build

```bash
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```
