# LIV-01 — Dossier d'Architecture Technique (DAT)

## Vitalis Center EUP — Architecture V1

### Vue d'ensemble
- **Frontend** : Angular 21 SPA (lazy loading, Tailwind CSS 4)
- **Backend** : NestJS 11 API REST modulaire
- **BDD** : PostgreSQL 16 + Prisma ORM (12 tables)
- **Stockage** : Local (dev) / S3-MinIO (prod)
- **Auth** : JWT Bearer + RBAC 5 rôles

### Modules backend
| Module | Responsabilité |
|--------|----------------|
| utilisateurs | Auth, register, refresh, profil |
| etablissements | CRUD multi-tenant |
| pedagogie | Formations, cours, notes, upload |
| seances | Planification + émargement |
| certification | PDF + QR + vérification publique |
| analytics | KPI assiduité, complétion, moyennes |

### Sécurité
- HTTPS recommandé en production
- bcrypt (12 rounds) pour mots de passe
- EtablissementGuard (BR-01) sur routes sensibles
- AuditLog immuable
- RLS Supabase : `prisma/sql/rls_policies.sql`

### Protocoles
- REST JSON `/api/*`
- Swagger : `/api/docs`
- CORS configuré via `CORS_ORIGIN`
