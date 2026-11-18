# System Architecture & Technical Design

## 1. Architectural Overview

The **Tender Corrigendum & Amendment Tracker** is constructed as an asynchronous, event-driven, decoupled service architecture designed for high data integrity, auditable traceability, and scalable document processing.

```mermaid
flowchart TD
    subgraph Client Layer
        Web["Next.js Responsive Web App\n(SSR + Client Components)"]
    end

    subgraph API & Gateway Layer
        API["NestJS REST API Server\n(/api/v1)"]
        Guard["RBAC & JWT Auth Guard"]
        Audit["Audit Log Interceptor"]
        API --> Guard
        API --> Audit
    end

    subgraph Data & Storage Layer
        DB[("PostgreSQL\n(Prisma ORM)")]
        Redis[("Redis 7\n(BullMQ & Cache)")]
        S3[("S3 Storage / MinIO\n(Immutable Document Vault)")]
    end

    subgraph Asynchronous Worker Layer
        DocWorker["Python Document Worker\n(FastAPI + PyMuPDF + Tesseract)"]
        CollectWorker["Collection Worker\n(Portal Adapters Engine)"]
        NotifyWorker["Notification Worker\n(In-App & Email Dispatch)"]
    end

    Web <-->|REST API / HTTPS| API
    API -->|Transactions & Queries| DB
    API -->|Signed Direct Uploads| S3
    API -->|Queue Jobs| Redis

    Redis -->|Process Job| DocWorker
    Redis -->|Scheduled Scrape| CollectWorker
    Redis -->|Send Alerts| NotifyWorker

    DocWorker -->|Fetch Raw PDF / Save Output| S3
    DocWorker -->|Submit Diff & Extractions| API
    CollectWorker -->|Ingest Candidates| API
    NotifyWorker -->|Update Delivery Status| DB
```

---

## 2. Component Specifications

### 2.1 Next.js Web Application (`apps/web`)
- **Framework**: Next.js 14+ (App Router, React Server Components where appropriate)
- **Styling**: Tailwind CSS with Radix UI headless primitives and Lucide Icons
- **Key Modules**:
  - `TenderTimeline`: Chronological visual journey showing issuance through all published corrigenda.
  - `VersionDiffViewer`: Side-by-side and inline document comparison highlighting additions (green), deletions (red), and modified values (amber).
  - `ReviewWorkbench`: Dedicated split-screen reviewer interface displaying source document page citations alongside machine-detected changes.
  - `AdminSourceConsole`: Management interface for portal configurations, rate limits, and collection health.

### 2.2 NestJS API Gateway (`apps/api`)
- **Framework**: NestJS (TypeScript) with Express/Fastify adapter
- **Key Responsibilities**:
  - Request validation via `class-validator` and `class-transformer`
  - Authentication (Argon2id/Bcrypt password hashing, JWT token issuance)
  - Role-Based Access Control (`@Roles('SUPER_ADMIN', 'REVIEWER')`)
  - Transactional database operations via Prisma ORM
  - Audit interceptors capturing before/after states for all mutation operations
  - Queue management and job orchestration via BullMQ

### 2.3 Document Processing Microservice (`services/document-processing`)
- **Framework**: Python 3.10+ FastAPI
- **Engines**:
  - **PyMuPDF (`fitz`)**: Lightning-fast native text extraction, font metadata, and table boundary identification from digital PDFs.
  - **Tesseract OCR / pdf2image**: Image-to-text conversion for scanned or non-searchable PDF pages.
  - **Diff Engine**: Computes token-level, sentence-level, and tabular diffs between base tender documents and revised notices.
  - **Classifier**: Pattern matching and rule-based entity recognition for dates, currency values, qualification periods, and EMD amounts.

### 2.4 Ingestion & Collection Worker (`services/collection-worker`)
- **Framework**: TypeScript Node.js background process
- **Capabilities**:
  - Pluggable portal adapter architecture (`TenderPortalAdapter`)
  - Exponential backoff retry policies and domain-level rate limiting
  - Checksum hashing (SHA-256) for deduplication at source fetch time
  - Candidate record staging into `CollectionItem` table prior to matching

---

## 3. Core Operational Workflows & Sequence Diagrams

### 3.1 Corrigendum Upload, Processing, & Review Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Reviewer as Reviewer / Admin
    participant API as NestJS API
    participant S3 as S3 / MinIO Storage
    participant Queue as Redis (BullMQ)
    participant Worker as Document Processing Service
    participant DB as PostgreSQL (Prisma)
    actor User as Subscribed Contractor

    Reviewer->>API: POST /tenders/:id/amendments (Upload Notice PDF)
    API->>S3: Store original immutable PDF (SHA-256)
    API->>DB: Create Amendment record (Status: PROCESSING)
    API->>Queue: Push 'process-document' job
    API-->>Reviewer: HTTP 202 Accepted (Processing initiated)

    Queue->>Worker: Consume 'process-document' job
    Worker->>S3: Retrieve original tender PDF & amendment PDF
    Worker->>Worker: Extract text, execute Diff Engine & Classifier
    Worker-->>API: Callback with structured changes & page evidence
    API->>DB: Store AmendmentChanges & Evidence (Status: NEEDS_REVIEW)

    Reviewer->>API: GET /amendments/:id (Review Workbench)
    API-->>Reviewer: Return old vs new values + document excerpts
    Reviewer->>API: POST /amendments/:id/review (Action: APPROVE)
    
    rect rgb(240, 248, 255)
        Note over API,DB: Atomic Publication Transaction
        API->>DB: Update Amendment (Status: APPROVED)
        API->>DB: Update Tender current snapshot
        API->>DB: Create TenderVersion snapshot (immutable)
        API->>DB: Append to AuditLog
        API->>Queue: Dispatch 'notify-subscribers' event
    end

    Queue->>API: Process notification dispatch
    API->>DB: Query followers of Tender
    API->>DB: Insert in-app notifications
    API-->>User: In-app notification & alert email sent
```

---

## 4. Scalability & Resilience Policies

1. **Decoupled Heavy Computation**: Document parsing and OCR never run on the web/API thread. They execute in isolated worker containers with resource limits (CPU/Memory caps).
2. **Graceful Degradation**: If an external portal changes layout or rate-limits requests, the adapter transitions to `PAUSED` or `BLOCKED` status without impacting the rest of the application.
3. **Idempotent Webhooks & Retries**: Queue jobs feature unique job IDs based on `sha256(tenderId + documentChecksum)` to prevent duplicate ingestion.

