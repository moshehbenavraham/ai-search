#!/usr/bin/env bash
#
# dev.sh - Local development script for AI Search
#
# Starts database (Docker), backend (native), and frontend (native) with hot reload.
# All output is combined in one terminal with colored prefixes.
#
# Usage: ./scripts/dev.sh [OPTIONS]
#
# Options:
#   --stop    Stop all dev services (preserves database volume)
#   --help    Show this help message
#
# Requirements:
#   - Docker (for PostgreSQL)
#   - uv (Python package manager)
#   - Node.js + npm
#

set -euo pipefail

# =============================================================================
# CONFIGURATION
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# =============================================================================
# COLORS
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# =============================================================================
# HELP
# =============================================================================

show_help() {
    echo -e "${CYAN}dev.sh${NC} - Local development script for AI Search"
    echo ""
    echo -e "${BOLD}USAGE:${NC}"
    echo "    ./scripts/dev.sh [OPTIONS]"
    echo ""
    echo -e "${BOLD}OPTIONS:${NC}"
    echo "    --stop    Stop all dev services (preserves database volume)"
    echo "    --help    Show this help message"
    echo ""
    echo -e "${BOLD}SERVICES:${NC}"
    echo "    PostgreSQL    → localhost:5439"
    echo "    Backend       → http://localhost:8009"
    echo "    Frontend      → http://localhost:5181"
    echo ""
    exit 0
}

# =============================================================================
# STOP FUNCTION
# =============================================================================

stop_services() {
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  Stopping dev services (preserving volumes)...${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Kill any running backend processes (fastapi on port 8009)
    if pgrep -f "fastapi.*8009" >/dev/null 2>&1; then
        echo -e "${BLUE}[BE]${NC} Stopping backend..."
        pkill -f "fastapi.*8009" 2>/dev/null || true
        sleep 1
        echo -e "${BLUE}[BE]${NC} Backend stopped."
    else
        echo -e "${BLUE}[BE]${NC} Backend not running."
    fi

    # Kill any running frontend processes (vite dev server)
    if pgrep -f "vite.*dev" >/dev/null 2>&1; then
        echo -e "${MAGENTA}[FE]${NC} Stopping frontend..."
        pkill -f "vite.*dev" 2>/dev/null || true
        sleep 1
        echo -e "${MAGENTA}[FE]${NC} Frontend stopped."
    else
        echo -e "${MAGENTA}[FE]${NC} Frontend not running."
    fi

    # Stop database container (preserves volume)
    if docker compose ps db --status running 2>/dev/null | grep -q "db"; then
        echo -e "${GREEN}[DB]${NC} Stopping database..."
        docker compose stop db >/dev/null 2>&1 || true
        echo -e "${GREEN}[DB]${NC} Database stopped (volume preserved)."
    else
        echo -e "${GREEN}[DB]${NC} Database not running."
    fi

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  All services stopped. Database volume preserved.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
}

# =============================================================================
# ARGUMENT PARSING
# =============================================================================

for arg in "$@"; do
    case $arg in
        --stop)
            cd "$(dirname "${BASH_SOURCE[0]}")/.."
            stop_services
            ;;
        --help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown option: $arg${NC}"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# =============================================================================
# PROCESS TRACKING
# =============================================================================

BACKEND_PID=""
FRONTEND_PID=""
DB_STARTED=false

# =============================================================================
# CLEANUP
# =============================================================================

cleanup() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  Shutting down...${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Kill backend if running
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${BLUE}[DB]${NC} Stopping backend (PID: $BACKEND_PID)..."
        kill "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
    fi

    # Kill frontend if running
    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo -e "${MAGENTA}[FE]${NC} Stopping frontend (PID: $FRONTEND_PID)..."
        kill "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
    fi

    # Stop database container
    if [ "$DB_STARTED" = true ]; then
        echo -e "${GREEN}[DB]${NC} Stopping database..."
        cd "$PROJECT_DIR"
        docker compose stop db >/dev/null 2>&1 || true
    fi

    echo -e "${GREEN}  All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   🚀  AI SEARCH - LOCAL DEVELOPMENT                          ║
  ║                                                               ║
  ║   Press Ctrl+C to stop all services                          ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

print_status() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

prefix_output() {
    local prefix="$1"
    local color="$2"
    while IFS= read -r line; do
        echo -e "${color}${prefix}${NC} $line"
    done
}

wait_for_db() {
    local max_attempts=30
    local attempt=1

    echo -e "${GREEN}[DB]${NC} Waiting for PostgreSQL to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
            echo -e "${GREEN}[DB]${NC} PostgreSQL is ready!"
            return 0
        fi
        echo -e "${GREEN}[DB]${NC} Waiting... (attempt $attempt/$max_attempts)"
        sleep 1
        ((attempt++))
    done

    echo -e "${RED}[DB]${NC} PostgreSQL failed to start!"
    return 1
}

# =============================================================================
# MAIN
# =============================================================================

cd "$PROJECT_DIR"

print_banner

# Check requirements
command -v docker >/dev/null 2>&1 || { echo -e "${RED}Error: docker is required${NC}"; exit 1; }
command -v uv >/dev/null 2>&1 || { echo -e "${RED}Error: uv is required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}Error: npm is required${NC}"; exit 1; }

# Check .env file
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found. Copy .env.example to .env${NC}"
    exit 1
fi

# =============================================================================
# 1. START DATABASE
# =============================================================================

print_status "Starting PostgreSQL database..."

docker compose up -d db
DB_STARTED=true

wait_for_db || exit 1

# =============================================================================
# 2. RUN PRESTART (migrations + initial data)
# =============================================================================

print_status "Running migrations and initial data..."

cd "$PROJECT_DIR/backend"

# Source .env for backend environment variables
set -a
source "$PROJECT_DIR/.env"
set +a

# Override for native local dev
export POSTGRES_SERVER=localhost
export POSTGRES_PORT=5439
export FRONTEND_HOST=http://localhost:5181
export BACKEND_CORS_ORIGINS="http://localhost,http://localhost:5179,http://localhost:5180,http://localhost:5181,http://localhost:8009,https://localhost,https://localhost:5179,https://localhost:5180,https://localhost:5181,http://localhost.tiangolo.com"

# Run prestart (migrations + create initial superuser)
echo -e "${BLUE}[BE]${NC} Running database migrations..."
uv run python -m alembic upgrade head 2>&1 | prefix_output "[BE]" "${BLUE}"
echo -e "${BLUE}[BE]${NC} Creating initial data..."
uv run python app/initial_data.py 2>&1 | prefix_output "[BE]" "${BLUE}"

# =============================================================================
# 3. START BACKEND
# =============================================================================

print_status "Starting backend (FastAPI with hot reload)..."

(uv run python -m fastapi dev app/main.py --host 0.0.0.0 --port 8009 2>&1 | prefix_output "[BE]" "${BLUE}") &
BACKEND_PID=$!

echo -e "${BLUE}[BE]${NC} Backend starting on http://localhost:8009"
echo -e "${BLUE}[BE]${NC} API docs: http://localhost:8009/docs"

# Give backend a moment to start
sleep 2

if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo -e "${RED}[BE]${NC} Backend failed to start."
    exit 1
fi

# =============================================================================
# 4. START FRONTEND
# =============================================================================

print_status "Starting frontend (Vite with hot reload)..."

cd "$PROJECT_DIR/frontend"

(npm run dev 2>&1 | prefix_output "[FE]" "${MAGENTA}") &
FRONTEND_PID=$!

echo -e "${MAGENTA}[FE]${NC} Frontend starting on http://localhost:5181"

sleep 2

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo -e "${RED}[FE]${NC} Frontend failed to start."
    exit 1
fi

# =============================================================================
# 5. SHOW STATUS AND WAIT
# =============================================================================

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  All services running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}[DB]${NC} PostgreSQL    → localhost:5439"
echo -e "  ${BLUE}[BE]${NC} Backend       → http://localhost:8009"
echo -e "  ${BLUE}[BE]${NC} API Docs      → http://localhost:8009/docs"
echo -e "  ${MAGENTA}[FE]${NC} Frontend      → http://localhost:5181"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Wait for processes
wait
