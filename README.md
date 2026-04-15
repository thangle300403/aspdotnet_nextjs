# QLSV Monorepo

This repository contains a simple student management system split into two parts:

- `QLSV`: ASP.NET Core Web API backend
- `qlsv-frontend`: Next.js frontend

The project is designed so the frontend consumes the backend API over HTTP, with JWT-based authentication used for protected endpoints.

## Repository Structure

```text
ASPdotnet/
├─ QLSV/            # ASP.NET Core 6 backend
└─ qlsv-frontend/   # Next.js frontend
```

## What `QLSV` Contains

`QLSV` is the backend service. It is responsible for:

- exposing REST APIs
- connecting to MySQL through Entity Framework Core
- handling login and refresh token flow
- protecting restricted endpoints with JWT Bearer authentication

### Backend stack

- ASP.NET Core 6
- Entity Framework Core 6
- Pomelo MySQL provider
- JWT Bearer authentication
- BCrypt password verification
- Swagger

### Main backend modules

- `Controllers/AuthController.cs`
  Handles login and access token refresh
- `Controllers/StudentController.cs`
  CRUD-style student endpoints
- `Controllers/SubjectController.cs`
  CRUD-style subject endpoints
- `Controllers/RegisterController.cs`
  CRUD-style register endpoints, protected with `[Authorize]`
- `Data/AppDbContext.cs`
  Entity Framework database context
- `Models/`
  Entity classes such as `student`, `subject`, `register`, and `user`

### Current API behavior

- `GET /api/student`
  Public
- `POST /api/student`
  Public in current code
- `PUT /api/student/{id}`
  Public in current code
- `DELETE /api/student/{id}`
  Public in current code
- `GET /api/subject`
  Public
- `POST /api/subject`
  Public in current code
- `PUT /api/subject/{id}`
  Public in current code
- `DELETE /api/subject/{id}`
  Public in current code
- `POST /api/auth/login`
  Returns an access token and sets a refresh-token cookie
- `POST /api/auth/refresh`
  Uses the refresh-token cookie to issue a new access token
- `/api/register/*`
  Protected with JWT authentication

### Backend configuration

The backend currently reads settings from `QLSV/appsettings.json`:

- MySQL connection string
- JWT key
- JWT issuer
- JWT audience

By default, the backend CORS policy allows:

- `http://localhost:3000`

## What `qlsv-frontend` Contains

`qlsv-frontend` is the user interface. It is responsible for:

- rendering the student, subject, and register pages
- calling backend APIs
- storing the access token in `localStorage`
- requesting a new access token when the old one expires
- redirecting users when a protected page requires authentication

### Frontend stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Formik
- Yup
- React Toastify

### Main frontend modules

- `app/login/page.tsx`
  Login screen
- `components/auth/LoginForm.tsx`
  Login form and submit flow
- `lib/authFetch.ts`
  Auth-aware fetch helper, token checks, refresh flow, redirect behavior
- `app/students/page.tsx`
  Student page
- `app/subjects/page.tsx`
  Subject page
- `app/registers/page.tsx`
  Register page

### Frontend configuration

The frontend reads the backend URL from:

- `qlsv-frontend/.env.local`

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5049
```

## How the Frontend and Backend Connect

The integration flow is:

1. The frontend sends login credentials to `POST /api/auth/login`.
2. The backend verifies the user and returns an `accessToken`.
3. The backend also sets a refresh-token cookie with `HttpOnly`.
4. The frontend stores the `accessToken` in `localStorage`.
5. Protected requests include `Authorization: Bearer <token>`.
6. If the access token expires, the frontend calls `POST /api/auth/refresh`.
7. The backend reads the refresh-token cookie and issues a new access token.

In this repository, the main auth helper is:

- `qlsv-frontend/lib/authFetch.ts`

That file currently handles:

- API URL construction
- access token presence check
- automatic refresh on `401`
- auth state updates
- redirect when the token is missing or no longer valid

## Local Development

### 1. Start the backend

From the repository root:

```bash
cd QLSV
dotnet run
```

The backend is currently expected to be available at:

```text
http://localhost:5049
```

### 2. Start the frontend

From the repository root:

```bash
cd qlsv-frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

## Notes

- `qlsv-frontend` is now tracked as a normal folder inside this repository, not as a submodule.
- `.env.local` is ignored by the root `.gitignore`.
- `node_modules`, `.next`, `bin`, and `obj` are ignored at the repository root.

## Suggested Improvements

- move secrets such as the JWT key and database connection string into environment variables
- protect student and subject write endpoints with authorization if required
- add a root-level setup guide for MySQL schema and seed data
- add route guards for all protected frontend pages
