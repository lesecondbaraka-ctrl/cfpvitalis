# Mise en place d'une base PostgreSQL locale

## 1. Installer PostgreSQL 15
Sur Windows, l'installation la plus simple est via le package officiel PostgreSQL.

## 2. Démarrer la base locale
Depuis le dossier `backend/scripts` :

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\start-local-db.ps1
```

## 3. Utiliser la base locale
Mettre à jour `.env` avec :

```env
DATABASE_URL=postgresql://postgres@localhost:5432/postgres
DIRECT_URL=postgresql://postgres@localhost:5432/postgres
```

## 4. Appliquer la migration
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npm run build
```
