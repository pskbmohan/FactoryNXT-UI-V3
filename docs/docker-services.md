# Docker Services — FactoryNXT

## Stack

| Service | Image | Port(s) | Purpose |
|---|---|---|---|
| `backend` | local build | `8000` | FastAPI application server |
| `postgres` | `postgres:16-alpine` | `5432` | Primary relational database |
| `redis` | `redis:7-alpine` | `6379` | Session cache, pub/sub, Celery broker |
| `minio` | `minio/minio:latest` | `9000` (API), `9001` (Console) | S3-compatible object storage |
| `minio_init` | `minio/mc:latest` | — | One-shot bucket provisioner |

---

## Quick Start

```bash
# 1. Copy env template
cp .env.example .env
# 2. Edit .env with real secrets

# 3. Start all services (detached)
docker compose up -d

# 4. Check health
docker compose ps

# 5. View logs
docker compose logs -f backend
docker compose logs -f redis
docker compose logs -f minio
```

---

## Redis

- **Image:** `redis:7-alpine` (minimal, production-grade)
- **Auth:** password-protected via `REDIS_PASSWORD` env var
- **Memory policy:** `allkeys-lru` at 256 MB — safe for session cache and task queues
- **Persistence:** AOF enabled (`appendonly yes`) + RDB snapshot every 60s if ≥1 key changed
- **Use cases in FactoryNXT backend:**
  - JWT token blocklist (logout invalidation)
  - API response caching (production order lists, recipe lookups)
  - Celery task broker / result backend
  - WebSocket presence tracking

### Connect from backend (Python)

```python
# settings.py
REDIS_URL: str = "redis://:changeme_redis@redis:6379/0"

# redis client
import redis.asyncio as aioredis
redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
```

---

## MinIO

- **Image:** `minio/minio:latest`
- **S3 API:** `http://localhost:9000` (frontend/backend external)
- **Console UI:** `http://localhost:9001` — login with `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`
- **Internal endpoint (Docker network):** `minio:9000`
- **Bucket auto-created:** `factorynxt` (via `minio_init` container)
- **Use cases in FactoryNXT backend:**
  - Recipe document attachments (PDF, XLSX)
  - Work-order and production report exports
  - Firmware and calibration blobs
  - Profile images / plant floor photos

### Connect from backend (Python)

```python
# settings.py
MINIO_ENDPOINT: str = "minio:9000"       # internal Docker hostname
MINIO_ACCESS_KEY: str = "factorynxt_admin"
MINIO_SECRET_KEY: str = "changeme_minio_secret"
MINIO_BUCKET_NAME: str = "factorynxt"
MINIO_SECURE: bool = False

# minio client
from minio import Minio
minio_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)
```

### Generate a pre-signed download URL

```python
from datetime import timedelta

url = minio_client.presigned_get_object(
    settings.MINIO_BUCKET_NAME,
    object_name="recipes/recipe-001.pdf",
    expires=timedelta(hours=1),
)
```

---

## Data Volumes

| Volume | Mounted in | What it stores |
|---|---|---|
| `postgres_data` | `/var/lib/postgresql/data` | All DB tables |
| `redis_data` | `/data` | AOF + RDB snapshots |
| `minio_data` | `/data` | All object blobs |

To reset a single service without destroying others:

```bash
docker compose down
docker volume rm factorynxt-ui-v3_redis_data
docker compose up -d
```

---

## Useful Commands

```bash
# Redis CLI (with auth)
docker exec -it factorynxt_redis redis-cli -a $REDIS_PASSWORD

# MinIO mc (alias already set by minio_init)
docker exec -it factorynxt_minio_init mc ls local/factorynxt

# Postgres psql
docker exec -it factorynxt_postgres psql -U factorynxt -d factorynxt_db

# Tail all logs
docker compose logs -f

# Stop without removing volumes
docker compose stop

# Full teardown (keeps volumes)
docker compose down

# Full teardown + delete all data
docker compose down -v
```
