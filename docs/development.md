# Development

See [development.md](../development.md) in the project root for the complete development guide.

## Quick Reference

### Start with Docker Compose

```bash
docker compose watch
```

### Start Manually

**Backend:**
```bash
cd backend && uv sync && source .venv/bin/activate && fastapi dev app/main.py
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

### Run Tests

```bash
# Backend
cd backend && bash scripts/test.sh

# Frontend E2E
cd frontend && npx playwright test
```

### Pre-commit

```bash
uv run pre-commit run --all-files
```
