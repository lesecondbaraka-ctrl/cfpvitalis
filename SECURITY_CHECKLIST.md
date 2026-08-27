# Security Checklist for Vitalis Centeur

This repository follows a secure API-first architecture: frontend communicates only through backend APIs, and the backend accesses the database through Prisma.

## General API Security Rules

- [x] Frontend must call only `environment.apiUrl` endpoints.
- [x] No direct database imports or direct DB access inside `frontend/src`.
- [x] Backend exposes routes through controllers only.
- [x] Backend uses Prisma as the only DB access layer.
- [x] Global API prefix is set to `/api` in `backend/src/main.ts`.
- [x] Global validation pipe is enabled in backend:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`

## Request Validation

- [x] Use DTOs for all request bodies.
- [x] Use `class-validator` decorators on DTO properties.
- [x] Use `ParseUUIDPipe` for all UUID route parameters.
- [x] Reject unknown body properties at the API boundary.

## Authentication and Authorization

- [x] Protect sensitive endpoints with `JwtAuthGuard`.
- [x] Use `RolesGuard` + `@Roles(...)` for role-based authorization.
- [x] Use `EtablissementGuard` for multi-tenant / institution scoping.
- [x] Enforce ownership checks inside services where needed.

## Backend Business Rules

- [x] Do not allow frontend to send sensitive fields like `role` during registration.
- [x] Backend assigns `Role.APPRENANT` for public registration.
- [x] Backend verifies establishment ownership for requests scoped by `etablissementId`.
- [x] Backend does not trust client-provided role or active-state fields.
- [x] Critical actions are logged in audit trails where applicable.

## Frontend Guidelines

- [x] Use API service classes under `frontend/src/app/core/services/`.
- [x] Do not import or reference backend DB modules from frontend code.
- [x] Use only the backend API as the data source.

## Modules Audited

The following modules have been verified as following the secure pattern:

- `utilisateurs`
- `etablissements`
- `pedagogie`
- `quiz`
- `devoirs`
- `certification`
- `analytics`
- `notifications`

## Notes

- `frontend/src/app/core/services/auth.service.ts` no longer sends `role` during registration.
- Public registration now uses server-side role assignment only.
- The frontend uses `environment.apiUrl` for all backend HTTP calls.
- The backend controllers and services apply validation, guards, and membership checks.

## Recommended next step

When adding new modules, follow this checklist and add a similar audit entry to this document.
