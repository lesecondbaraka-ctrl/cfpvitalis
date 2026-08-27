Infrastructure recommendations

1) S3 lifecycle for `certificats` and `uploads`
- Use S3 lifecycle rules to transition older files to Glacier/Deep Archive after 90 days.
- For legal certificates, consider enabling Object Lock (WORM) and retention policies.

AWS CLI example to set lifecycle (replace BUCKET):

```bash
aws s3api put-bucket-lifecycle-configuration --bucket BUCKET --lifecycle-configuration '{"Rules":[{"ID":"CertificatsTransition","Filter":{"Prefix":"certificats/"},"Status":"Enabled","Transitions":[{"Days":90,"StorageClass":"STANDARD_IA"},{"Days":365,"StorageClass":"GLACIER"}],"NoncurrentVersionTransitions":[],"AbortIncompleteMultipartUpload":{"DaysAfterInitiation":7}}]}'
```

2) Server-side encryption
- Ensure bucket policy enforces `aws:kms` or `AES256` server-side encryption.

3) Backups
- Use `pg_dump` regularly, store backups in a separate secure bucket with lifecycle.
- Rotate backups and test restores monthly.

4) Monitoring & Observability
- Export application metrics (Prometheus): request latency, error rates, auth failures, refresh token revocations.
- Setup Grafana dashboards for KPIs and alerting on anomalies.

5) Secrets management
- Use a secrets manager (Vault / AWS Secrets Manager) to store `JWT_SECRET`, `DB credentials`, and `S3` keys.

6) CI/CD
- Add `prisma migrate deploy` to deployment pipeline and run integration tests before migration.
