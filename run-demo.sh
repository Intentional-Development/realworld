#!/usr/bin/env bash
set -euo pipefail

# RealWorld Conduit Demo Runner
# Boots the generated backend (app/node-api) and vendored frontend (React) for end-to-end testing

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/realworld-idl/generated/app/node-api"
FRONTEND_DIR="${REPO_ROOT}/realworld/frontend"

BACKEND_PORT=3000
FRONTEND_PORT=4100
BACKEND_PID=""
FRONTEND_PID=""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
  exit 1
}

cleanup() {
  echo ""
  echo "🛑 Stopping servers..."
  
  if [[ -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
    sleep 2
    kill -9 "$BACKEND_PID" 2>/dev/null || true
  fi
  
  if [[ -n "$FRONTEND_PID" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    sleep 2
    kill -9 "$FRONTEND_PID" 2>/dev/null || true
  fi
  
  echo "🛑 Stopped"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Pre-flight checks
echo "🔍 Pre-flight checks..."

if [[ ! -d "$BACKEND_DIR" ]]; then
  log_error "Backend not found at $BACKEND_DIR. Run 'idl generate' first."
fi

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  log_error "Frontend dependencies not installed. Run 'cd realworld/frontend && npm install --legacy-peer-deps' first."
fi

if lsof -i :"$BACKEND_PORT" > /dev/null 2>&1; then
  log_error "Port $BACKEND_PORT already in use. Stop the conflicting process first."
fi

if lsof -i :"$FRONTEND_PORT" > /dev/null 2>&1; then
  log_error "Port $FRONTEND_PORT already in use. Stop the conflicting process first."
fi

log_info "Pre-flight checks passed"

# Boot backend
echo ""
echo "🚀 Starting backend at http://localhost:$BACKEND_PORT/api..."
cd "$BACKEND_DIR"

# Install backend dependencies if needed
if [[ ! -d "node_modules" ]]; then
  echo "📦 Installing backend dependencies..."
  npm install > /dev/null 2>&1
fi

# Start backend in background
PORT=$BACKEND_PORT APP_ALLOWED_ORIGINS="http://localhost:$FRONTEND_PORT" node src/main.mjs > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend readiness
echo "⏳ Waiting for backend to be ready..."
for i in {1..20}; do
  if grep -q "\[app/node-api\] listening on" backend.log 2>/dev/null; then
    log_info "Backend ready at http://localhost:$BACKEND_PORT/api"
    break
  fi
  if [[ $i -eq 20 ]]; then
    cat backend.log
    log_error "Backend failed to start within 20 seconds"
  fi
  sleep 1
done

# Verify backend is responsive
if ! curl -f -s http://localhost:$BACKEND_PORT/api/tags > /dev/null; then
  cat backend.log
  log_error "Backend not responsive at http://localhost:$BACKEND_PORT/api/tags"
fi

# Boot frontend
echo ""
echo "🚀 Starting frontend at http://localhost:$FRONTEND_PORT..."
cd "$FRONTEND_DIR"

# Generate API types if not already generated
if [[ ! -d "src/shared/api/generated" ]]; then
  echo "📦 Generating API types from OpenAPI spec..."
  npm run generate > /dev/null 2>&1 || log_warn "API generation had warnings (continuing anyway)"
fi

# Start frontend in background
PORT=$FRONTEND_PORT NODE_ENV=development API_URL=http://localhost:$BACKEND_PORT/api npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend readiness
echo "⏳ Waiting for frontend to be ready..."
for i in {1..60}; do
  if curl -f -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
    log_info "Frontend ready at http://localhost:$FRONTEND_PORT"
    break
  fi
  if [[ $i -eq 60 ]]; then
    tail -50 frontend.log
    log_error "Frontend failed to start within 60 seconds"
  fi
  sleep 1
done

# Success output
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "RealWorld Conduit demo is running!"
echo ""
echo "  🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo "  🔌 Backend:  http://localhost:$BACKEND_PORT/api"
echo ""
echo "  📝 Logs:"
echo "     Backend:  $BACKEND_DIR/backend.log"
echo "     Frontend: $FRONTEND_DIR/frontend.log"
echo ""
echo "Press Ctrl+C to stop both servers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Open browser if requested
if [[ "${SQUAD_OPEN_BROWSER:-0}" == "1" ]]; then
  if command -v open &> /dev/null; then
    sleep 2
    open "http://localhost:$FRONTEND_PORT"
  fi
fi

# Tail logs to stdout
tail -f "$BACKEND_DIR/backend.log" "$FRONTEND_DIR/frontend.log" 2>/dev/null || wait
