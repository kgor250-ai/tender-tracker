# REST API Specification

**Base URL**: `/api/v1`  
**Protocol**: HTTPS  
**Content-Type**: `application/json` (or `multipart/form-data` for file uploads)  

---

## 1. Authentication & Security Headers

All protected endpoints require an HTTP Bearer JWT token in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

### Standard Error Envelope
All error responses adhere to the standard envelope:
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested tender could not be found.",
    "details": [],
    "requestId": "req-98f2-4bc3",
    "timestamp": "2026-11-13T16:50:00Z"
  }
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication (`/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Create new registered user account |
| `POST` | `/auth/login` | Public | Authenticate and obtain JWT access token & refresh cookie |
| `POST` | `/auth/refresh` | Public | Exchange refresh token for fresh access token |
| `POST` | `/auth/logout` | Authenticated | Revoke active refresh token session |
| `GET` | `/me` | Authenticated | Retrieve current user profile and role authorizations |

### 2.2 Tenders (`/tenders`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/tenders` | Public | List and search tenders with pagination, status, and department filters |
| `POST` | `/tenders` | Admin / Reviewer | Create new tender record with notice details |
| `GET` | `/tenders/{id}` | Public | Retrieve full tender details and active snapshot |
| `PATCH` | `/tenders/{id}` | Admin / Reviewer | Update tender metadata (pre-approval draft state only) |
| `GET` | `/tenders/{id}/timeline` | Public | Retrieve complete chronological history (issuance + all corrigenda) |
| `GET` | `/tenders/{id}/versions` | Public | List historical immutable `TenderVersion` snapshots |
| `POST` | `/tenders/{id}/follow` | Authenticated | Follow tender (add to watchlist) |
| `DELETE` | `/tenders/{id}/follow` | Authenticated | Unfollow tender |

### 2.3 Amendments & Corrigenda (`/amendments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/tenders/{id}/amendments` | Admin / Reviewer | Upload corrigendum notice PDF and initiate processing |
| `GET` | `/amendments/{id}` | Public (Approved) / Staff | Retrieve amendment details and review status |
| `POST` | `/amendments/{id}/process` | Admin / Reviewer | Re-trigger PDF extraction and diff engine |
| `GET` | `/amendments/{id}/changes` | Reviewer / Admin | List proposed and approved field changes with evidence |
| `POST` | `/amendments/{id}/review` | Reviewer / Admin | Submit review decision (`APPROVE`, `REJECT`, `NEEDS_CORRECTION`) |
| `GET` | `/amendments/{id}/compare` | Public | Fetch side-by-side textual diff against base tender |

### 2.4 User Notifications (`/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Authenticated | Retrieve current user's in-app notification inbox |
| `PATCH` | `/notifications/{id}/read` | Owner | Mark notification as read |
| `POST` | `/notifications/read-all` | Owner | Mark all notifications as read |

### 2.5 Portal Sources & Administration (`/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/sources` | Admin | List configured portal adapters and run states |
| `POST` | `/admin/sources` | Admin | Register new portal source configuration |
| `PATCH` | `/admin/sources/{id}` | Admin | Update scrape interval, enabled status, or rate limit |
| `POST` | `/admin/collection-jobs` | Admin | Trigger immediate on-demand collection run |
| `GET` | `/admin/collection-jobs` | Admin / Reviewer | Monitor recent collection job runs and item yields |
| `GET` | `/admin/analytics/overview` | Admin / Reviewer | Summary metrics (amendments by month, department trends) |
| `GET` | `/admin/audit-logs` | Admin | Searchable audit trail with actor and date filters |

---

## 3. Sample Payloads

### 3.1 Create Tender (`POST /api/v1/tenders`)
```json
{
  "tenderNumber": "DEMO/PWD/2026/001",
  "title": "Demonstration Road Widening and Maintenance Works",
  "organizationName": "Public Works Department",
  "departmentName": "Roads & Bridges Division",
  "publicationDate": "2026-11-10T09:00:00+05:30",
  "submissionDeadline": "2026-11-20T17:00:00+05:30",
  "estimatedValue": 5000000.00,
  "currency": "INR",
  "sourceUrl": "https://eproc.example.gov/notice/PWD-2026-001"
}
```

### 3.2 Review Decision Submission (`POST /api/v1/amendments/{id}/review`)
```json
{
  "decision": "APPROVE",
  "notes": "Verified deadline extension to 25-Nov-2026 against published Corrigendum 01 notice.",
  "reviewedChanges": [
    {
      "changeId": "d3b07384-d113-40e9-b3a1-77b5a192d6e3",
      "status": "VERIFIED"
    }
  ]
}
```

### 3.3 Successful Approval Response
```json
{
  "data": {
    "amendmentId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "reviewStatus": "APPROVED",
    "newVersionNumber": 2,
    "publishedAt": "2026-11-13T16:55:00Z",
    "notificationsQueued": 14
  }
}
```

