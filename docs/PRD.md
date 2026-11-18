# Product Requirements Document (PRD)
## Tender Corrigendum & Amendment Tracker

**Document Version:** 1.0  
**Status:** Baseline Blueprint – Approved for Implementation  
**Audience:** System Architects, Software Engineers, DevOps, QA, and Product Operations  

---

## 1. Executive Summary & Vision

The **Tender Corrigendum & Amendment Tracker** is a dedicated enterprise procurement intelligence platform. Its sole mission is to ensure that no tender update, corrigendum, technical addendum, or cancellation goes unnoticed, unverified, or unrecorded.

### 1.1 Vision
To establish an authoritative, transparent, and auditable single source of truth for public and private tender lifecycles, enabling contractors, bidders, and monitoring authorities to review changes in deadlines, eligibility criteria, scope, and commercial terms with cryptographic certainty and visual clarity.

### 1.2 Core Architectural Principles
1. **Never Overwrite History**: Prior tender versions, raw notices, and approved corrigenda are preserved as immutable historical records.
2. **Provenance & Traceability**: Every imported record links to a source URL, portal identifier, fetch timestamp, and file SHA-256 hash.
3. **Human-in-the-Loop Verification**: Automated text extractions and difference detections are provisional until authorized reviewers sign off.
4. **Accuracy Over Volume**: Ambiguous tender linkages are held in a human review queue rather than guess-linked.
5. **Least Privilege**: Role-based access control (RBAC) enforced strictly at the API layer.
6. **Graceful Degradation**: Manual document uploads remain first-class citizens when external portals are rate-limited or blocked.

---

## 2. Problem Statement & Objectives

### 2.1 The Problem
Public procurement agencies routinely issue changes after tender publication. These corrigenda are often published as separate PDF notices without direct notifications to prospective bidders. Bidders must manually monitor dozens of portals, manually inspect dense legal PDFs, and risk disqualification by submitting bids based on superseded specifications or outdated deadlines.

### 2.2 Goals & Key Results (OKRs)
- **Centralized Journey**: Provide a chronological, visual timeline for every tender from issuance to award or cancellation.
- **Automated Comparison**: Automatically extract textual and tabular data from notices and highlight additions, deletions, and date changes.
- **Reviewer Confidence**: Equip procurement officers and reviewers with side-by-side evidence inspection tools before public dissemination.
- **Zero-Latency Alerts**: Notify interested contractors via in-app feeds and email notifications within 5 minutes of approved publication.

---

## 3. Scope & Boundaries

### 3.1 In-Scope
- Responsive web portal for Super Admin, Reviewer, and Registered User roles.
- Manual tender entry and manual corrigendum PDF upload workflows.
- Modular automated collection adapters for permitted public procurement portals.
- PDF text parsing and optical character recognition (OCR) fallback engine.
- Visual side-by-side and inline document diff viewing.
- Immutable event store capturing all tender version changes.
- Follower subscriptions and notification dispatch.
- Audit logging of all administrative actions.

### 3.2 Out-of-Scope (Non-Goals)
- Bid preparation, electronic tender submissions, or payment gateway processing.
- Legal advisory or compliance guarantees on government portal terms.
- Circumventing CAPTCHAs, paywalls, or anti-bot defenses on non-consenting portals.
- Autonomous publication of unreviewed AI extractions.

---

## 4. User Personas & Permissions

| Role | Responsibilities | Permissions |
| :--- | :--- | :--- |
| **Super Admin** | System configuration, portal adapters, user roles, security audits, disaster recovery. | Full CRUD on all entities, portal configuration, audit log viewer, user activation/deactivation. |
| **Reviewer** | Review candidate corrigenda, inspect extracted field diffs, approve/reject amendments, resolve ambiguous linkages. | Create tenders, upload amendments, approve/reject changes, edit metadata, view review queue. |
| **Registered User** | Browse and filter tenders, follow tenders, receive amendment alerts, view public timeline and diffs. | Read published tenders/amendments, manage personal subscriptions and notification preferences. |
| **Public Visitor** | View published tender notices and high-level amendments without alerts. | Read-only access to published tenders. |

---

## 5. Functional Requirements Matrix

| ID | Area | Description | Priority |
| :--- | :--- | :--- | :--- |
| **FR-001** | Authentication | Secure credential authentication (Argon2id/Bcrypt), JWT session tokens, refresh token rotation. | **MUST** |
| **FR-002** | RBAC | Strict role verification on all API endpoints; denial returns HTTP 403 Forbidden. | **MUST** |
| **FR-003** | Tender Management | Create, edit, and archive tender notices with identifiers, department, dates, and value. | **MUST** |
| **FR-004** | Search & Filter | Multi-parameter search by tender number, title, department, status, category, and date ranges. | **MUST** |
| **FR-005** | Manual Ingestion | Upload PDF/ZIP notices with metadata (issuing portal, ref number, publication date). | **MUST** |
| **FR-006** | Source Registry | Configure portal adapters, scrape frequencies, rate limits, and authentication headers. | **MUST** |
| **FR-007** | Automated Ingestion | Scheduled collector jobs fetch permitted public tenders and corrigenda into intake queues. | **SHOULD** |
| **FR-008** | Deduplication | Detect duplicate documents and notices using SHA-256 checksums and normalized reference IDs. | **MUST** |
| **FR-009** | Amendment Linkage | Match corrigenda to parent tenders using tender numbers and entity resolution algorithms. | **MUST** |
| **FR-010** | Document Processing | Parse digital PDFs and route scanned images through Tesseract OCR to extract clean text. | **MUST** |
| **FR-011** | Diff & Change Engine | Compare original document against amendment, isolating date, financial, and clause changes. | **MUST** |
| **FR-012** | Review Workbench | Reviewer UI showing old vs new values, source excerpts, confidence scores, and action buttons. | **MUST** |
| **FR-013** | Version Immutability | Approved corrigenda append a new immutable `TenderVersion` snapshot; prior snapshots cannot be edited. | **MUST** |
| **FR-014** | Visual Timeline | Interactive chronological UI displaying initial publication, corrigenda 1..N, and current status. | **MUST** |
| **FR-015** | Follow / Watchlist | Users can follow tenders with 1-click; stores personalized notification preferences. | **MUST** |
| **FR-016** | Notification Dispatch | Trigger in-app alerts and transactional emails when an approved amendment is published. | **SHOULD** |
| **FR-017** | Analytics Dashboard | Aggregate metrics: amendment frequency, mean time between corrigenda, department trends. | **SHOULD** |
| **FR-018** | Data Export | Export tender dossiers and amendment histories to CSV, JSON, and PDF formats. | **SHOULD** |
| **FR-019** | Audit Logging | Log all administrative actions with actor ID, action name, resource, IP hash, and diff. | **MUST** |
| **FR-020** | Health & Observability | Expose `/health` endpoints, BullMQ queue telemetry, and background worker status. | **MUST** |

