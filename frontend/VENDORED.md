# Vendored Frontend

**Upstream Repository:** https://github.com/yurisldk/realworld-react-fsd  
**Commit SHA:** 963b303  
**Vendor Date:** 2026-04-30  
**License:** MIT (verified in upstream LICENSE file)  

## Rationale

This is a reference implementation of the RealWorld/Conduit frontend using React 19 + Feature-Sliced Design architecture. We vendored (copied) the code at a specific commit rather than using a git submodule to:

1. Lock the version and prevent unexpected upstream changes
2. Simplify the monorepo structure (no submodule ceremony)
3. Allow local patches if needed without forking

## Configuration

The frontend expects an `API_URL` environment variable pointing to the backend. This is configured via `.env.local` (gitignored) or `.env.example` (tracked).

## Technology Stack

- React 19.2.4
- React Router 7.13.0
- TanStack React Query 5.90.20
- Zod 4.3.6 (validation)
- Webpack 5.97.1
- TypeScript 5.4.5

## Build Commands

- `npm start` or `yarn start`: Development server (default port 30401)
- `npm run build:prod`: Production build
- `npm test`: Run tests

## Original README

See README.md in this directory for the original upstream documentation.
