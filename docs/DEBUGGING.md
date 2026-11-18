# Debugging & Diagnostics Runbook

## 1. Structured Debugging Methodology

When investigating unexpected behaviors or system anomalies, follow this 6-step checklist:

1. **Capture Identifiers**: Collect `requestId`, `correlationId`, `tenderId`, and `amendmentId` from HTTP response headers or UI alerts.
2. **Inspect API Logs**: Check structured JSON logs in `apps/api` for corresponding `requestId`.
3. **Inspect Redis Job Queue**: Examine BullMQ queue state (Active, Waiting, Failed, Delayed) in Redis.
4. **Inspect Document Worker Logs**: Review Python FastAPI extraction logs for memory exhaustion, font encoding issues, or OCR timeouts.
5. **Verify Database State**: Inspect raw database records in PostgreSQL via Prisma Studio or `psql` to check `review_status`, `sha256`, and foreign keys.
6. **Reproduce with Minimal Payload**: Re-run the failure in local development using synthetic sanitized test documents.

---

## 2. Troubleshooting Matrix

| Symptom | Probable Cause | Diagnostic & Remediation Steps |
| :--- | :--- | :--- |
| **Login fails for all users** | 1. Database unavailable<br>2. `AUTH_SECRET` changed or missing<br>3. Cookie domain mismatch in HTTPS | Check container health (`docker compose ps`). Verify `.env` has valid `AUTH_SECRET`. Inspect browser console for cookie rejection. |
| **Uploaded PDF remains stuck in `PROCESSING`** | 1. Redis queue stopped<br>2. Document worker crashed on large file<br>3. S3 upload incomplete | Check Redis: `redis-cli ping`. Inspect `document-processing` container logs. Check if file size exceeded `MAX_UPLOAD_SIZE_MB`. |
| **PDF Extraction yields empty text** | Scanned image PDF without embedded font stream | Ensure Tesseract OCR language data (`tessdata`) is installed. Verify `OCR_ENGINE=tesseract` in `.env`. Check that `pdf2image` and `poppler` are in PATH. |
| **Diff Engine shows excessive noisy changes** | Layout changes, header/footer text variations, page numbers | Verify text normalization pipeline strips recurring header/footer regexes before comparison. |
| **Tender not found in search** | 1. Status is `DRAFT`<br>2. Punctuation mismatch in tender number | Ensure searching uses `normalized_tender_number` (strips `/`, `-`, spaces). Verify search filter includes non-published states if logged in as staff. |
| **Followers not receiving email notifications** | 1. SMTP credentials incorrect<br>2. Worker queue failed<br>3. Notification marked failed in DB | Inspect `notifications` table for `status = 'FAILED'` and inspect `error_code`. Test SMTP connection using Mailtrap or SendGrid test script. |
| **Duplicate corrigenda appearing** | Weak deduplication criteria on source imports | Check `documents.sha256` index. Confirm adapter computes hash before creating candidate records in `collection_items`. |

---

## 3. Log Anatomy & Correlation

All services emit logs formatted as single-line JSON with the following canonical schema:

```json
{
  "timestamp": "2026-11-13T16:55:00.123Z",
  "level": "INFO",
  "service": "api",
  "requestId": "req-98f2-4bc3",
  "actorId": "usr-admin-001",
  "event": "AMENDMENT_APPROVED",
  "tenderId": "tnd-road-2026",
  "amendmentId": "amd-corrigendum-01",
  "message": "Amendment Corrigendum 01 approved by admin; version 2 published"
}
```

