# LIV-02 — Schéma Base de Données Validé

## 12 tables PostgreSQL (Prisma V3)

| # | Table | Modèle Prisma |
|---|-------|---------------|
| 1 | etablissements | Etablissement |
| 2 | utilisateurs | Utilisateur |
| 3 | formations | Formation |
| 4 | modules | Module |
| 5 | cours | Cours |
| 6 | seances_formation | SeanceFormation |
| 7 | presences_seances | PresenceSeance |
| 8 | progression_cours | UserProgress |
| 9 | evaluations | Evaluation |
| 10 | notes | Note |
| 11 | certificats | Certificat |
| 12 | table_audit | AuditLog |

## Migration versionnée
- Fichier : `backend/prisma/migrations/20260707140000_init/migration.sql`
- Commande : `npx prisma migrate deploy`

## RLS Supabase
- Fichier : `backend/prisma/sql/rls_policies.sql`
