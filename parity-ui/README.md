# RealWorld T2b UI Parity — Playwright Smoke Tests

Validates that the generated backend (`realworld-idl/generated/app/node-api/`) correctly serves the reference frontend (`realworld/frontend/`) for critical user flows.

## What is T2b?

**T2b = Tier 2b UI Parity**

Proves source→IDL→executable parity with a navigable browser UI. This is the first visible-UI demo for the Intentional project.

### Scope (7 Gates)

Per Stark's spec (`.squad/decisions/inbox/stark-conduit-frontend-scope.md`, Section 4.1):

| Gate | Action | Proves |
|------|--------|--------|
| **G1** | Home page loads with tag list | Frontend boots + backend `/tags` endpoint works |
| **G2** | Register new user | `POST /users` + JWT token issuance |
| **G3** | Logout | Frontend clears token from localStorage |
| **G4** | Login | `POST /users/login` + JWT validation |
| **G5** | Create article | `POST /articles` with auth token |
| **G6** | View article in global feed | `GET /articles` returns created article |
| **G7** | Favorite article | `POST /articles/:slug/favorite` with auth token |

All 7 gates must pass for T2b claim.

### Out of Scope

T2b does **NOT** validate:
- ❌ Visual pixel parity (CSS differences are acceptable)
- ❌ Full feature set (Edit, Delete, Comments, Follow, Profile pages)
- ❌ Cross-browser testing (Chromium only)
- ❌ Error states (tested via Hurl)
- ❌ Performance metrics
- ❌ Mobile/responsive design
- ❌ Accessibility (WCAG compliance)

## Prerequisites

**CRITICAL:** This test suite does NOT manage server lifecycle. You must run the demo script first.

### 1. Start the demo servers

```bash
cd /Users/carloshm/personal-projects/intentional
bash realworld/run-demo.sh
```

This boots:
- **Backend** at `http://localhost:3000/api` (app/node-api)
- **Frontend** at `http://localhost:4100` (yurisldk/realworld-react-fsd)

Verify servers are running:
```bash
curl http://localhost:3000/api/tags  # Should return {"tags": [...]}
curl http://localhost:4100           # Should return HTML
```

### 2. Install test dependencies

```bash
cd realworld/parity-ui
npm install
npx playwright install chromium
```

**Note:** Chromium installation is ~100MB. Only needed once.

## Running Tests

```bash
# Run smoke test (headless)
npx playwright test

# Run with visible browser (for debugging)
npx playwright test --headed

# Debug mode (pauses at each step)
npx playwright test --debug

# Show HTML report after run
npx playwright show-report
```

### Expected Output

```
Running 1 test using 1 worker

  ✓  t2b-smoke.spec.ts:28:3 › T2b UI Parity — 7-Gate Smoke Flow › G1 → G7 (15s)

  1 passed (15s)
```

If any gate fails, check:
1. Backend logs (run-demo.sh terminal)
2. Frontend console (open `http://localhost:4100` in browser, check DevTools)
3. Playwright trace: `npx playwright show-trace test-results/.../trace.zip`

## Selector Strategy

Tests use **semantic role-based selectors** (not brittle CSS):
- `getByRole('link', { name: /sign in/i })`
- `getByPlaceholder(/email/i)`
- `getByRole('button', { name: /publish/i })`

This makes tests resilient to CSS class changes in the frontend.

Where Stark's spec provided specific selectors (e.g., `.article-preview`), we use them for precision. Otherwise, we prefer semantic queries.

## Test Data

Each test run generates a unique user to avoid collisions:
- Username: `parity-{timestamp}`
- Email: `parity-{timestamp}@example.com`
- Password: `TestPass123!`

Articles created during tests remain in the in-memory SQLite database until the backend is restarted.

## Troubleshooting

### Connection Refused Errors

**Symptom:** `Error: connect ECONNREFUSED ::1:4100`

**Cause:** Frontend or backend not running.

**Fix:** Run `bash realworld/run-demo.sh` first.

---

### CORS Errors in Browser Console

**Symptom:** `Access-Control-Allow-Origin` errors

**Cause:** Backend missing CORS headers.

**Fix:** Banner added CORS middleware in commit `f2b5f44`. Regenerate backend if using old version:
```bash
cd realworld-idl
npm run generate
```

---

### Tests Fail at G2 (Register)

**Symptom:** Register form submits but redirect fails or username not shown.

**Possible causes:**
1. JWT token format mismatch (backend returns token but frontend can't parse it)
2. Backend validation error (check backend logs for 422 response)

**Debug:**
```bash
# Check backend response manually
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"user":{"username":"test","email":"test@example.com","password":"testpass"}}'
```

---

### Tests Fail at G5 (Create Article)

**Symptom:** Article creation form submits but article not created or slug mismatch.

**Possible causes:**
1. Auth token not sent correctly (check `Authorization: Token {jwt}` header)
2. Slug generation differs between frontend and backend

**Debug:**
```bash
# Get token from browser localStorage (DevTools → Application → Local Storage)
# Then create article manually:
curl -X POST http://localhost:3000/api/articles \
  -H "Authorization: Token {your-jwt-here}" \
  -H "Content-Type: application/json" \
  -d '{"article":{"title":"Test","description":"Test","body":"Test"}}'
```

---

## CI Integration (Future)

To run in CI:
```yaml
- name: Boot RealWorld demo
  run: bash realworld/run-demo.sh &
  
- name: Wait for servers
  run: |
    timeout 30 bash -c 'until curl -f http://localhost:3000/api/tags; do sleep 1; done'
    timeout 30 bash -c 'until curl -f http://localhost:4100; do sleep 1; done'

- name: Run T2b smoke tests
  run: |
    cd realworld/parity-ui
    npm ci
    npx playwright install --with-deps chromium
    npx playwright test
```

## See Also

- **Stark's T2b Spec:** `.squad/decisions/inbox/stark-conduit-frontend-scope.md`
- **Banner's CORS Fix:** `.squad/decisions/inbox/banner-cors-boot-infra.md`
- **Demo Runner:** `realworld/run-demo.sh` (Parker's work, in progress)
- **Frontend Source:** `realworld/frontend/` (yurisldk/realworld-react-fsd @ `963b303`)
- **Generated Backend:** `realworld-idl/generated/app/node-api/`

---

**Owner:** Barton (Tester)  
**Status:** Harness ready, awaiting Parker's completion of `run-demo.sh` for end-to-end validation  
**Last Updated:** 2026-04-30
