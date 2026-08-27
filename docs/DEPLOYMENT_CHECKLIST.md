# Checklist de déploiement

## 1. Préparer la base
- Vérifier que la base PostgreSQL cible est accessible.
- Exécuter la migration SQL contenue dans [backend/prisma/migrations/20260709_add_refresh_tokens/migration.sql](backend/prisma/migrations/20260709_add_refresh_tokens/migration.sql).
- Vérifier que la table `refresh_tokens` existe.

## 2. Variables d’environnement
- Définir `JWT_SECRET` avec une valeur forte.
- Définir `CORS_ORIGIN` selon le domaine frontend.
- Définir `SWAGGER_ENABLED=false` en production si Swagger ne doit pas être public.
- Si `SWAGGER_ENABLED=true`, définir `SWAGGER_TOKEN`.

## 3. Déploiement backend
```bash
cd backend
npm install
npx prisma generate
npm run build
npm start
```

## 4. Validation rapide
- Tester `/api/utilisateurs/login`
- Tester `/api/utilisateurs/refresh`
- Tester `/api/utilisateurs/logout`
- Vérifier que les routes protégées répondent 401 sans token.

## 5. Sauvegarde
- Sauvegarder la base avant toute nouvelle migration.
- Ajouter la sauvegarde à la procédure d’opération.
