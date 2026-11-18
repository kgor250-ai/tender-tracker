# Operations, Incident Response & Runbook

## 1. Incident Severity Classifications

| Level | Definition | Target Response | Target Resolution | Escalation Path |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-1** | Critical outage; database corruption; unreviewed AI/corrigendum accidentally published publicly; data breach. | < 15 mins | < 2 hours | Lead Architect, Security Officer, Operations Lead |
| **SEV-2** | Core review workbench unusable; document processing queue stalled; portal adapters failing broadly. | < 30 mins | < 6 hours | Backend Team Lead, DevOps Engineer |
| **SEV-3** | Non-critical feature degradation (e.g., email notification delay; analytics charts slow; minor UI glitch). | < 2 hours | Next release | Assigned Feature Engineer |
| **SEV-4** | Cosmetic issues; documentation typos; minor logging anomalies. | Next business day | Backlog sprint | Standard PR triage |

---

## 2. Emergency Operational Procedures

### 2.1 Emergency Rollback of an Inadvertently Approved Corrigendum
If an unverified or erroneous corrigendum was mistakenly marked as `APPROVED` by a reviewer:

1. **Invoke Reversion API / Admin Action**:
   ```bash
   POST /api/v1/admin/amendments/:id/revoke
   Authorization: Bearer <super_admin_jwt>
   Content-Type: application/json
   {
     "reason": "Mistaken approval; corrigendum contained unverified scope change.",
     "incidentTicket": "INC-8891"
   }
   ```
2. **What Occurs Internally**:
   - The amendment status is transitioned to `REVOKED`.
   - A new compensating `TenderVersion` snapshot is committed reverting active tender fields to Version `N-1`.
   - A corrective notification is broadcast to all followers explaining the retraction.
   - An immutable SEV-1 audit event is recorded.

### 2.2 Pausing an External Portal Adapter
If an external government portal implements strict anti-scraping measures, returns repeated HTTP 429 errors, or undergoes major HTML layout revisions:

1. Execute via CLI or Admin Console:
   ```bash
   PATCH /api/v1/admin/sources/:sourceId
   { "isEnabled": false, "statusReason": "Portal layout altered on 13-Nov; parsing paused pending adapter update." }
   ```
2. The scheduler cancels all active BullMQ repeat jobs for that source adapter immediately.
3. Fallback to manual intake workbench is maintained for staff users.

---

## 3. Database Backup & Disaster Recovery (DR)

### 3.1 Automated Snapshot Schedule
- **Full Database Dump**: Nightly at 01:00 UTC using `pg_dump -Fc` with AES-256 encryption stored in cross-region object storage.
- **WAL Archiving**: Continuous Write-Ahead Logging to S3 for Point-In-Time Recovery (PITR) with Recovery Point Objective (RPO) < 15 minutes.
- **Retention**: Daily backups retained for 30 days; weekly backups retained for 90 days.

### 3.2 Recovery Drill Procedure
```bash
# 1. Spin up an isolated PostgreSQL restore container
docker run -d --name restore-test -e POSTGRES_PASSWORD=restorepass postgres:15-alpine

# 2. Restore from snapshot file
pg_restore -h localhost -p 5433 -U postgres -d tender_tracker_restored /backups/tender_backup_latest.dump

# 3. Verify integrity
psql -h localhost -p 5433 -U postgres -d tender_tracker_restored -c "SELECT COUNT(*) FROM tenders; SELECT COUNT(*) FROM amendments;"
```

