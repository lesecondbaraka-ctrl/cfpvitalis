# Vitalis Center EUP — Plateforme Multi-Tenant

Système de digitalisation pour centres de formation professionnelle.

## Stack

- **Backend** : NestJS 11 + Prisma + PostgreSQL
- **Frontend** : Angular 21 + Tailwind CSS 4
- **API** : REST `/api` — Swagger : `http://localhost:3000/api/docs`

## Démarrage rapide

### Prérequis
- Node.js 20+
- PostgreSQL 16+

### Backend
```bash
cd backend
cp .env.example .env   # Configurer DATABASE_URL
npm install
npx prisma db push
npm run seed
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Application : `http://localhost:4200`

## Comptes démo (mot de passe : `Vitalis2025!`)

| Email | Rôle |
|-------|------|
| admin@vitalis-center.fr | ADMIN_CENTRE |
| admin.lyon@vitalis-center.fr | ADMIN_ETABLISSEMENT |
| formateur@vitalis-center.fr | FORMATEUR |
| apprenant@vitalis-center.fr | APPRENANT |
| personnel@vitalis-center.fr | PERSONNEL_ADMINISTRATIF |

## Docker
```bash
docker-compose up -d
```

## Fonctionnalités implémentées

- Multi-tenant (BR-01, BR-02) avec guards établissement
- RBAC 5 rôles
- CRUD établissements, formations, modules, cours
- E-learning avec complétion de cours
- Séances de formation + émargement électronique
- Saisie de notes avec sélecteur d'apprenants
- Certificats PDF + QR Code + vérification publique (BR-03, BR-04)
- Tableaux de bord analytics / KPI
- Journal d'audit
- Upload documents (stockage local ou S3)
