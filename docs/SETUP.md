# Developer Setup & Installation Guide

This guide walks through configuring, installing, and running the complete **Tender Corrigendum & Amendment Tracker** system in a local development environment.

---

## 1. System Requirements

- **Operating System**: Windows 10/11, macOS 12+, or Ubuntu 20.04+ (WSL2 recommended for Windows)
- **Node.js**: v18.18.0 or v20.x LTS
- **Package Manager**: `pnpm` (recommended: `corepack enable && corepack prepare pnpm@latest --activate`) or `npm` v9+
- **Python**: 3.10 or 3.11 with `pip`
- **Docker**: Docker Desktop or Docker Engine with Docker Compose v2+
- **System Memory**: Minimum 8GB RAM (16GB recommended for local OCR testing)

---

## 2. Step-by-Step Installation

### Step 1: Environment File Setup
Copy the sample environment variables:
```bash
cp .env.example .env
```
Ensure the default ports and database credentials in `.env` match your local environment.

### Step 2: Launch Supporting Containers
Start PostgreSQL, Redis, and MinIO object storage:
```bash
docker compose up -d postgres redis minio
```
Verify all containers are healthy:
```bash
docker compose ps
```

### Step 3: Install Workspace Dependencies
From the repository root:
```bash
pnpm install
```

### Step 4: Run Database Migrations & Seed Data
Initialize the PostgreSQL schema and populate the database with default roles, administrators, sample portal sources, and realistic corrigenda scenarios:
```bash
# Generate Prisma Client
pnpm prisma:generate

# Execute Database Migration
pnpm prisma:migrate

# Seed Database with Test Scenarios (Corrigenda 01, 02, 03)
pnpm db:seed
```

### Step 5: Start Python Document Processing Microservice
In a new terminal window:
```bash
cd services/document-processing

# Create virtual environment
python -m venv .venv

# Activate environment:
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server on port 8001
uvicorn app.main:app --reload --port 8001
```

### Step 6: Start Web Frontend & API Gateway
In your primary terminal:
```bash
pnpm dev
```

---

## 3. Verification & Accessing Interfaces

| Service | URL | Default Credentials |
| :--- | :--- | :--- |
| **Next.js Web Portal** | [http://localhost:3000](http://localhost:3000) | Reviewer: `reviewer@tender-tracker.local` / `Reviewer@12345`<br>Admin: `admin@tender-tracker.local` / `Admin@12345`<br>User: `contractor@example.com` / `User@12345` |
| **NestJS REST API** | [http://localhost:4000/api/v1](http://localhost:4000/api/v1) | — |
| **Swagger API Docs** | [http://localhost:4000/api/docs](http://localhost:4000/api/docs) | — |
| **Document Processing** | [http://localhost:8001/health](http://localhost:8001/health) | Returns `{"status": "ok"}` |
| **MinIO S3 Console** | [http://localhost:9001](http://localhost:9001) | `minioadmin` / `minioadmin` |
| **Prisma Studio** | `pnpm prisma:studio` -> [http://localhost:5555](http://localhost:5555) | Direct database viewer |

---

## 4. Common Troubleshooting During Setup

### PostgreSQL Connection Refused
- Check if Docker container is running: `docker logs tender-tracker-postgres`
- Ensure port 5432 is not occupied by a native local PostgreSQL service. If so, modify `POSTGRES_PORT=5433` in `.env` and `docker-compose.yml`.

### Python PyMuPDF or Tesseract Errors
- PyMuPDF includes pre-compiled C-wheels. If building from source fails, verify Python is 64-bit: `python -c "import sys; print(sys.maxsize > 2**32)"`.
- On Windows, install Tesseract OCR from UB-Mannheim and ensure `tesseract.exe` path is specified in `.env`.

