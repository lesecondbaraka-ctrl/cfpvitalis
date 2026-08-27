# 🚀 Guide de Déploiement en Production — Vitalis Center EUP

Ce guide résume la procédure pas-à-pas pour déployer Vitalis Center en production de manière 100% sécurisée.

---

## 🏗️ 1. Architecture de Production

```mermaid
graph TD
    Client["Utilisateurs Web / Navigateurs"] -->|"HTTPS (Port 443)"| Nginx["Nginx Reverse Proxy (Frontend SPA)"]
    Nginx -->|"SPA Routes (/)"| Static["Fichiers Angular Compilés"]
    Nginx -->|"API & SSE (/api/)"| Nest["Backend NestJS (Node 22 / Port 3000)"]
    Nginx -->|"Uploads (/uploads/)"| Uploads["Storage Local / MinIO S3"]
    Nest -->|"Prisma ORM (Port 5432)"| Postgres[("PostgreSQL 16 / Supabase")]
```

---

## 📋 2. Checklist Pré-Déploiement

- [x] Code source épuré de tous les scripts de debug temporaires.
- [x] Contrôles d'accès globaux `JwtAuthGuard` + `RolesGuard` actifs.
- [x] `ValidationPipe` global activé (`whitelist: true, forbidNonWhitelisted: true`).
- [x] Signature binaire (Magic Bytes) + Assainissement de nom sur tous les uploads.
- [x] Double Rate Limiting anti-brute force configuré.
- [x] Configuration Nginx optimisée pour le streaming SSE et la compression Gzip.
- [x] Dockerfile multi-stage avec génération automatique du client Prisma.
- [x] Tests unitaires validés (18/18 tests réussis).

---

## ⚙️ 3. Déploiement avec Docker Compose (Recommandé)

### A. Cloner le projet et préparer l'environnement
```bash
git clone <url-du-depot> vitalis-center
cd vitalis-center
```

### B. Créer le fichier `.env` de production
```bash
cp backend/.env.example backend/.env
```
Éditez `backend/.env` avec vos vrais identifiants :
```env
NODE_ENV=production
DATABASE_URL="postgresql://vitalis:VOTRE_MOT_DE_PASSE@postgres:5432/vitalis_center"
JWT_SECRET="GENEREZ_UNE_CLE_FORTE_64_CHARS"
CORS_ORIGIN="https://vitalis-center.cd,https://www.vitalis-center.cd"
SWAGGER_ENABLED=false
STORAGE_MODE=local
```

### C. Démarrer les services
```bash
docker compose up -d --build
```

### D. Appliquer les migrations de base de données
```bash
docker compose exec backend npx prisma migrate deploy
```

---

## 🌐 4. Configuration SSL (Let's Encrypt / Certbot)

Si vous utilisez un serveur VPS dédié (Ubuntu / Debian) :
```bash
sudo apt update && sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d vitalis-center.cd -d www.vitalis-center.cd
```
Le renouvellement automatique sera géré par Certbot via cron/systemd.

---

## 🔍 5. Vérification Post-Déploiement (Smoke Tests)

1. **Accès Landing Page :** Ouvrez `https://vitalis-center.cd` (doit charger instantanément avec SSL actif).
2. **Formulaire de Contact :** Envoyer un message test depuis la landing page.
3. **Connexion Admin Centre :** Se connecter sur `/login` avec le compte superviseur.
4. **Vérification Certificat :** Tester la recherche d'un numéro de série sur `/verifier`.
5. **Flux Notifications SSE :** Vérifier que les toasts et notifications en temps réel arrivent sans déconnexion.
