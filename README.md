# To Do

A full-stack web application designed for simple, personal task management built with **Node.js, Express.js, TypeScript, React.js, PostgreSQL, and Prisma ORM**.

---

## Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone and Install Dependencies](#1-clone-and-install-dependencies)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Database Setup and Migrations](#3-database-setup-and-migrations)
  - [4. Running the Backend](#4-running-the-backend)
  - [5. Running the Frontend](#5-running-the-frontend)
- [Testing the Forgot / Reset Password Flow](#testing-the-forgot--reset-password-flow)
- [API Endpoints Reference](#api-endpoints-reference)
- [Security & Data Ownership](#security--data-ownership)
- [Scripts Reference](#scripts-reference)

---

## Overview

**To Do** is a clean, straightforward task management system built according to the Technical Assessment requirements. Registered users can authenticate securely, view task summary metrics, and perform complete task CRUD operations (Create, Read, Update, Delete) strictly isolated to their own accounts through a unified, table-based interface.

---

## Technologies Used

### Backend
- **Runtime & Framework:** Node.js, Express.js (v5)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM (v7 with `@prisma/adapter-pg`)
- **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs` password hashing, `cookie-parser`
- **Validation:** `zod`
- **Email Delivery:** `nodemailer`

### Frontend
- **Framework & Tooling:** React 19, TypeScript, Vite
- **Routing:** React Router DOM (v7)
- **API Client:** Axios (reusable configured instance with interceptors and credential support)
- **Styling:** Vanilla CSS design system (clean, responsive layout with CSS variables, table listings, badges, and modals)

---

## Key Features

1. **Authentication**
   - User registration (First Name, Last Name, Username, Email, Password, Confirm Password).
   - Input validation (valid email format, minimum 8-character passwords, password matching, duplicate username/email checks).
   - Passwords securely hashed with `bcryptjs` (cost factor 12).
   - Login with JWT stored in HTTP-only cookies and returned in payload for Authorization header compatibility.
   - Persistent authentication across page refreshes via `/api/auth/me`.
   - Protected and public-only routing.

2. **Forgot & Reset Password**
   - Forgot password request with secure, non-enumerating responses (prevents account discovery).
   - Cryptographically random, single-use, 1-hour expiring reset tokens.
   - Immediate invalidation upon successful reset; old passwords will no longer work.
   - Local console link logging for development ease, with optional SMTP support.

3. **Dashboard**
   - Live metrics calculated directly from the database:
     - **Total Tasks**
     - **To Do**
     - **In Progress**
     - **Completed**
     - **Overdue Tasks** (tasks past due date and not marked completed).
   - Quick task creation and preview of recent tasks.

4. **Task Management**
   - Table-based task listing with Status and Priority badges.
   - Real-time search by task title.
   - Filtering by status (`To Do`, `In Progress`, `Completed`) and priority (`Low`, `Medium`, `High`).
   - Modal-based task creation and editing.
   - Complete task detail modal view.
   - Destructive action confirmation modal for task deletion.
   - Clear visual indicators for overdue tasks.
   - Meaningful empty states and error/success alerts.

5. **User Profile**
   - View profile details (First Name, Last Name, Username, Email, Member Since).
   - Update profile with unique email and username validation (properly handling when retaining current values).

6. **Strict Data Ownership & Security**
   - Every database query for tasks is scoped by `userId` retrieved from the verified auth token.
   - Cross-user data access attempts return `404 Not Found`.

---

## Prerequisites

- **Node.js**: v18.x or higher (v20+ recommended)
- **npm**: v9.x or higher
- **PostgreSQL**: v14+ running locally or remotely

---

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repository-url>
cd task-management

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Environment Configuration

#### Backend Configuration
Inside the `backend/` directory, copy the example environment file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual PostgreSQL database credentials and a secret key:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_app"
PORT=5000
JWT_SECRET="your-secure-jwt-secret-key-at-least-32-chars"
FRONTEND_URL="http://localhost:5173"

# Optional: SMTP Configuration for email sending
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE="false"
EMAIL_FROM='"Task Management Support" <no-reply@taskapp.com>'
```

#### Frontend Configuration
Inside the `frontend/` directory, copy the example environment file:

```bash
cd ../frontend
cp .env.example .env
```

The default configuration connects to the backend at `http://localhost:5000/api` (proxied in Vite):

```env
VITE_API_URL="http://localhost:5000/api"
```

---

### 3. Database Setup and Migrations

Ensure your PostgreSQL server is running and the database specified in `DATABASE_URL` exists.

```bash
cd backend

# Run Prisma migrations to create the database schema
npx prisma migrate dev

# Seed initial task statuses (To Do, In Progress, Completed) and priorities (Low, Medium, High)
npx tsx prisma/seed.ts
```

---

### 4. Running the Backend

From the `backend/` directory:

```bash
# Development mode with auto-reload
npm run dev

# Or build and start production server
npm run build
npm run start
```

The backend server will run on `http://localhost:5000`. You can verify health at `http://localhost:5000/api/health`.

---

### 5. Running the Frontend

From the `frontend/` directory in a new terminal window:

```bash
npm run dev
```

The frontend application will start on `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

---

## Testing the Forgot / Reset Password Flow

The password reset mechanism is designed to be fully testable in both development and production environments.

1. **Request Reset Link:**
   - On the login page (`http://localhost:5173/login`), click **"Forgot password?"**.
   - Enter your registered email address and submit the form.
   - A success message will appear: *"If an account associated with this email exists, password reset instructions have been sent."* (This message intentionally does not leak whether the email exists).

2. **Retrieve the Reset Link (Development Mode):**
   - Look at the terminal running the backend server (`npm run dev`).
   - You will see the reset link printed clearly in the console output:
     ```text
     --------------------------------------------------
     [PASSWORD RESET] For: user@example.com
     [PASSWORD RESET] Link: http://localhost:5173/reset-password?token=a1b2c3d4...
     --------------------------------------------------
     ```

3. **Reset the Password:**
   - Click or copy the link into your browser.
   - Enter your **New Password** (minimum 8 characters) and confirm it.
   - Click **"Reset Password"**.
   - You will receive a confirmation message and a button to return to login.

4. **Verify Verification Checks:**
   - Attempt to log in with the **old password** &rarr; returns `401 Invalid email or password`.
   - Log in with the **new password** &rarr; successfully logs in.
   - Try using the same reset link a second time &rarr; returns `400 This password reset token has already been used`.

---

## API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token/cookie | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Get currently authenticated user | Yes |
| `POST` | `/api/auth/forgot-password` | Request password reset token | No |
| `POST` | `/api/auth/reset-password` | Set new password with token | No |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Get user task statistics (total, status counts, overdue) | Yes |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | List tasks (supports `?search=`, `?status=`, `?priority=`) | Yes |
| `GET` | `/api/tasks/meta` | Get available statuses and priorities | Yes |
| `GET` | `/api/tasks/:id` | View task details | Yes |
| `POST` | `/api/tasks` | Create a new task | Yes |
| `PUT` | `/api/tasks/:id` | Update an existing task | Yes |
| `DELETE`| `/api/tasks/:id` | Delete a task | Yes |

### User Profile (`/api/profile`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/profile` | Get current user's profile | Yes |
| `PUT` | `/api/profile` | Update profile (First Name, Last Name, Username, Email) | Yes |

---

## Security & Data Ownership

- **Backend Enforcement:** Data ownership is strictly enforced in backend Prisma queries (`where: { id: taskId, userId: authUserId }`). Even if an authenticated user attempts to request, update, or delete another user's task ID via URL manipulation or raw API calls, the server returns `404 Not Found`.
- **Password Protection:** Passwords are never returned in API responses and are hashed using `bcryptjs` with salt round 12.
- **Sensitive Data Exposure:** Error handling middleware prevents leaking database errors or server stack traces to clients.
- **Expiring Single-Use Tokens:** Password reset tokens expire after 1 hour and are flagged as `usedAt` upon completion to prevent reuse.

---

## Scripts Reference

### Backend (`/backend`)
- `npm run dev`: Start backend server with hot-reload via `tsx`.
- `npm run build`: Compile TypeScript into `dist/`.
- `npm run start`: Run compiled production server.

### Frontend (`/frontend`)
- `npm run dev`: Start Vite development server.
- `npm run build`: Type-check and build production bundle.
- `npm run preview`: Preview production build locally.
