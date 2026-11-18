# Testing Strategy & Acceptance Criteria

## 1. Multi-Tier Testing Strategy

The quality assurance framework covers five distinct testing boundaries:

1. **Unit Testing**: Isolated verification of normalization logic, regular expression extractors, date parsers, diff tokenizers, and role validation.
2. **Integration Testing**: Database transactions via Prisma, BullMQ job queuing, S3 file storage uploads, and JWT session handling.
3. **API Contract Testing**: End-to-end HTTP tests asserting request validation, RBAC enforcement, error envelopes, and HTTP status codes.
4. **Worker / Pipeline Testing**: Corrigendum ingestion, text extraction, OCR fallback, and structured change generation.
5. **End-to-End (E2E) Workflow Testing**: Complete user journeys from manual tender creation to amendment approval and follower alert dispatch.

---

## 2. Test Cases Execution Matrix (TC-001 - TC-020)

| ID | Scenario | Input / Action | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-001** | Valid Authentication | Valid registered credentials | HTTP 200; JWT access token & secure HTTP-only refresh cookie returned. |
| **TC-002** | Invalid Authentication | Incorrect password | HTTP 401; generic invalid credentials message without user enumeration. |
| **TC-003** | RBAC Guard Denial | Registered User calls `POST /api/v1/tenders` | HTTP 403 Forbidden; action denied; security audit log recorded. |
| **TC-004** | Create Tender Notice | Valid tender payload | HTTP 201; Tender record and initial immutable `TenderVersion (v1)` saved. |
| **TC-005** | Duplicate Tender Ref | Submit existing `source_tender_ref` | Conflict detected; HTTP 409 or duplicate candidate flagged for review. |
| **TC-006** | Valid Document Upload | Upload 5MB valid PDF notice | File hashed with SHA-256; stored in S3 vault; status set to `PROCESSING`. |
| **TC-007** | Malicious File Upload | Upload disguised `.exe` renamed to `.pdf` | MIME sniffing fails; upload rejected with HTTP 400; event logged. |
| **TC-008** | Automatic Linkage | Corrigendum contains exact tender number | Corrigendum automatically mapped to parent tender with confidence 1.0. |
| **TC-009** | Ambiguous Linkage | Corrigendum matches two tenders by title | Linkage marked `UNRESOLVED`; held in reviewer queue; no auto-publish. |
| **TC-010** | Date Change Extraction | Corrigendum extends deadline from 20 to 25 Nov | Diff engine detects deadline extension; highlights old/new dates + page citation. |
| **TC-011** | Scanned Image PDF | Upload image-only scanned corrigendum | Native text density low; triggers Tesseract OCR fallback; extracts text. |
| **TC-012** | Reviewer Rejection | Reviewer rejects amendment with note | Amendment marked `REJECTED`; audit entry saved; no public publication. |
| **TC-013** | Reviewer Approval | Reviewer approves verified changes | Transaction commits: new `TenderVersion (v2)` created; tender status `AMENDED`. |
| **TC-014** | History Immutability | Query `TenderVersion (v1)` after v2 approval | v1 state remains completely intact and matches original publication snapshot. |
| **TC-015** | Follow Subscription | User clicks "Follow" on tender | Unique `followed_tenders` row created; preferences stored. |
| **TC-016** | Notification Dedupe | Re-trigger publication event | Idempotency key prevents duplicate email or in-app alerts to followers. |
| **TC-017** | Adapter Transient Error | External portal returns HTTP 503 | Worker uses exponential backoff (retries: 3); logs detailed error status. |
| **TC-018** | Adapter Blocked Error | External portal returns HTTP 403 / anti-bot | Worker pauses safely without bypassing defenses; flags source as `BLOCKED`. |
| **TC-019** | Analytics Aggregation | Query `/admin/analytics/overview` | Corrigenda counts, turnaround times, and department breakdowns match DB. |
| **TC-020** | Audit Trail Verification | Admin edits tender metadata | `AuditLog` captures actor ID, action, timestamp, before_state, and after_state. |

---

## 3. Running Automated Tests

```bash
# Run all workspace unit tests
pnpm test

# Run API integration tests
cd apps/api && pnpm test:e2e

# Run Document Processing microservice tests
cd services/document-processing
pytest tests/ -v
```

