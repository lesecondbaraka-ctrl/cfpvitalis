# LIV-04 — Code Source Applicatif Complet

## Dépôt Git
- Backend : `backend/` (NestJS)
- Frontend : `frontend/` (Angular 21)
- Docker : `docker-compose.yml`

## Tests automatisés
```bash
cd backend && npm test        # 9 tests unitaires
cd backend && npm run test:e2e # 6 tests e2e
cd frontend && npm run build  # Build production
```

## Endpoints API (~40 routes)
- Auth : login, register, refresh, me
- CRUD : établissements, formations, modules, cours
- Métier : séances, émargement, notes, certificats PDF
- Analytics : global, établissement, formation
- Public : vérification certificat, liste établissements

## Couverture fonctionnelle V1 : ~90%
