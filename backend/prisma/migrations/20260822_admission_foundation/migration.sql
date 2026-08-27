-- Foundation admission + hub-and-spoke (additive, no drop of LMS tables)

CREATE TYPE "type_etablissement" AS ENUM ('MERE', 'SATELLITE_NATIONAL', 'SATELLITE_INTERNATIONAL');
CREATE TYPE "statut_etablissement" AS ENUM ('PROVISIONNE', 'ACTIF', 'SUSPENDU', 'FERME');
CREATE TYPE "statut_candidature" AS ENUM (
  'BROUILLON', 'SOUMISE', 'EN_EVALUATION', 'ADMISE', 'LISTE_ATTENTE',
  'REJETEE', 'CONFIRMEE', 'INSCRITE', 'RETIREE', 'EXPIREE'
);
CREATE TYPE "mode_selection" AS ENUM ('PREMIER_ARRIVE', 'DOSSIER_NOTES', 'TEST_APTITUDE', 'ENTRETIEN', 'MIXTE');
CREATE TYPE "statut_session_admission" AS ENUM ('BROUILLON', 'OUVERTE', 'FERMEE', 'TRAITEMENT', 'CLOTUREE');
CREATE TYPE "statut_inscription" AS ENUM ('RESERVEE', 'ACTIVE', 'TERMINEE', 'ABANDONNEE', 'ANNULEE');
CREATE TYPE "politique_candidature_concurrente" AS ENUM ('BLOCAGE_STRICT', 'AUTORISATION_ALERTE', 'MISE_EN_RESERVE');
CREATE TYPE "type_piece_candidature" AS ENUM ('PIECE_IDENTITE', 'DIPLOME', 'RELEVE_NOTES', 'PHOTO', 'AUTRE');

ALTER TABLE "etablissements"
  ADD COLUMN IF NOT EXISTS "type_etablissement" "type_etablissement" NOT NULL DEFAULT 'SATELLITE_NATIONAL',
  ADD COLUMN IF NOT EXISTS "statut" "statut_etablissement" NOT NULL DEFAULT 'ACTIF',
  ADD COLUMN IF NOT EXISTS "parent_etablissement_id" UUID,
  ADD COLUMN IF NOT EXISTS "pays" VARCHAR(3),
  ADD COLUMN IF NOT EXISTS "fuseau_horaire" VARCHAR(50) DEFAULT 'Africa/Kinshasa',
  ADD COLUMN IF NOT EXISTS "langue_defaut" VARCHAR(5) DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS "parametres_autonomie" JSONB,
  ADD COLUMN IF NOT EXISTS "reglement_local" JSONB;

CREATE INDEX IF NOT EXISTS "idx_etablissements_parent" ON "etablissements"("parent_etablissement_id");

ALTER TABLE "etablissements"
  ADD CONSTRAINT "etablissements_parent_etablissement_id_fkey"
  FOREIGN KEY ("parent_etablissement_id") REFERENCES "etablissements"("id") ON UPDATE NO ACTION ON DELETE SET NULL;

CREATE TABLE "filieres" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(20) NOT NULL,
    "libelle" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "filieres_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "filieres_code_key" ON "filieres"("code");

CREATE TABLE "niveaux" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(20) NOT NULL,
    "libelle" VARCHAR(255) NOT NULL,
    "ordre" INTEGER NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "niveaux_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "niveaux_code_key" ON "niveaux"("code");

CREATE TABLE "formations_referentiel" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "filiere_id" UUID NOT NULL,
    "niveau_id" UUID NOT NULL,
    "libelle" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "formations_referentiel_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "formations_referentiel_filiere_id_fkey" FOREIGN KEY ("filiere_id") REFERENCES "filieres"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "formations_referentiel_niveau_id_fkey" FOREIGN KEY ("niveau_id") REFERENCES "niveaux"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE UNIQUE INDEX "unique_filiere_niveau" ON "formations_referentiel"("filiere_id", "niveau_id");

CREATE TABLE "prerequis_niveaux" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "niveau_cible_id" UUID NOT NULL,
    "niveau_requis_id" UUID NOT NULL,
    CONSTRAINT "prerequis_niveaux_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "prerequis_niveaux_niveau_cible_id_fkey" FOREIGN KEY ("niveau_cible_id") REFERENCES "niveaux"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "prerequis_niveaux_niveau_requis_id_fkey" FOREIGN KEY ("niveau_requis_id") REFERENCES "niveaux"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE UNIQUE INDEX "prerequis_niveaux_niveau_cible_id_niveau_requis_id_key" ON "prerequis_niveaux"("niveau_cible_id", "niveau_requis_id");

ALTER TABLE "formations"
  ADD COLUMN IF NOT EXISTS "formation_referentiel_id" UUID;
CREATE INDEX IF NOT EXISTS "idx_formations_referentiel" ON "formations"("formation_referentiel_id");
ALTER TABLE "formations"
  ADD CONSTRAINT "formations_formation_referentiel_id_fkey"
  FOREIGN KEY ("formation_referentiel_id") REFERENCES "formations_referentiel"("id") ON UPDATE NO ACTION ON DELETE SET NULL;

CREATE TABLE "parametres_reseau" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "etablissement_mere_id" UUID NOT NULL,
    "politique_concurrente" "politique_candidature_concurrente" NOT NULL DEFAULT 'MISE_EN_RESERVE',
    "max_voeux" INTEGER NOT NULL DEFAULT 5,
    "delai_confirmation_jours" INTEGER NOT NULL DEFAULT 7,
    "matricule_prefixe" VARCHAR(10) NOT NULL DEFAULT 'VIT',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "parametres_reseau_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "parametres_reseau_etablissement_mere_id_fkey" FOREIGN KEY ("etablissement_mere_id") REFERENCES "etablissements"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE UNIQUE INDEX "parametres_reseau_etablissement_mere_id_key" ON "parametres_reseau"("etablissement_mere_id");

CREATE TABLE "apprenants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "matricule" VARCHAR(20) NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telephone" VARCHAR(30),
    "date_naissance" DATE,
    "numero_identite" VARCHAR(50),
    "pays_origine" VARCHAR(3),
    "utilisateur_id" UUID,
    "etablissement_origine_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "apprenants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "apprenants_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON UPDATE NO ACTION ON DELETE SET NULL,
    CONSTRAINT "apprenants_etablissement_origine_id_fkey" FOREIGN KEY ("etablissement_origine_id") REFERENCES "etablissements"("id") ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE UNIQUE INDEX "apprenants_matricule_key" ON "apprenants"("matricule");
CREATE UNIQUE INDEX "apprenants_email_key" ON "apprenants"("email");
CREATE UNIQUE INDEX "apprenants_utilisateur_id_key" ON "apprenants"("utilisateur_id");
CREATE INDEX "idx_apprenants_identite" ON "apprenants"("numero_identite");

CREATE TABLE "sessions_admission" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "etablissement_id" UUID NOT NULL,
    "filiere_id" UUID NOT NULL,
    "niveau_id" UUID NOT NULL,
    "formation_id" UUID,
    "libelle" VARCHAR(255) NOT NULL,
    "statut" "statut_session_admission" NOT NULL DEFAULT 'BROUILLON',
    "mode_selection" "mode_selection" NOT NULL DEFAULT 'MIXTE',
    "capacite" INTEGER NOT NULL DEFAULT 30,
    "date_ouverture" TIMESTAMPTZ(6) NOT NULL,
    "date_fermeture" TIMESTAMPTZ(6) NOT NULL,
    "date_debut_formation" TIMESTAMPTZ(6) NOT NULL,
    "delai_confirmation_jours" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_admission_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sessions_admission_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissements"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "sessions_admission_filiere_id_fkey" FOREIGN KEY ("filiere_id") REFERENCES "filieres"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "sessions_admission_niveau_id_fkey" FOREIGN KEY ("niveau_id") REFERENCES "niveaux"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "sessions_admission_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE INDEX "idx_sessions_etab_statut" ON "sessions_admission"("etablissement_id", "statut");
CREATE INDEX "idx_sessions_filiere_niveau" ON "sessions_admission"("filiere_id", "niveau_id");

CREATE TABLE "candidatures" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "apprenant_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "statut" "statut_candidature" NOT NULL DEFAULT 'BROUILLON',
    "score_evaluation" DECIMAL(5,2),
    "rang_liste_attente" INTEGER,
    "motif_rejet" TEXT,
    "date_soumission" TIMESTAMPTZ(6),
    "date_decision" TIMESTAMPTZ(6),
    "date_confirmation" TIMESTAMPTZ(6),
    "date_expiration" TIMESTAMPTZ(6),
    "commentaire_gestionnaire" TEXT,
    "metadonnees_locales" JSONB,
    "conflit_calendrier" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "candidatures_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "candidatures_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "apprenants"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "candidatures_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions_admission"("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE UNIQUE INDEX "unique_apprenant_session" ON "candidatures"("apprenant_id", "session_id");
CREATE INDEX "idx_candidatures_session_statut" ON "candidatures"("session_id", "statut");
CREATE INDEX "idx_candidatures_apprenant_statut" ON "candidatures"("apprenant_id", "statut");

CREATE TABLE "pieces_candidature" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidature_id" UUID NOT NULL,
    "type" "type_piece_candidature" NOT NULL,
    "file_url" VARCHAR(512) NOT NULL,
    "nom_fichier" VARCHAR(255) NOT NULL,
    "valide" BOOLEAN DEFAULT false,
    "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pieces_candidature_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pieces_candidature_candidature_id_fkey" FOREIGN KEY ("candidature_id") REFERENCES "candidatures"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);

CREATE TABLE "historique_candidatures" (
    "id" BIGSERIAL NOT NULL,
    "candidature_id" UUID NOT NULL,
    "statut_avant" "statut_candidature",
    "statut_apres" "statut_candidature" NOT NULL,
    "auteur_id" UUID,
    "commentaire" TEXT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historique_candidatures_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "historique_candidatures_candidature_id_fkey" FOREIGN KEY ("candidature_id") REFERENCES "candidatures"("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
CREATE INDEX "idx_historique_candidature" ON "historique_candidatures"("candidature_id");

CREATE TABLE "inscriptions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "apprenant_id" UUID NOT NULL,
    "formation_id" UUID NOT NULL,
    "candidature_id" UUID,
    "session_id" UUID,
    "statut" "statut_inscription" NOT NULL DEFAULT 'ACTIVE',
    "date_debut" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMPTZ(6),
    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inscriptions_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "apprenants"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "inscriptions_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "inscriptions_candidature_id_fkey" FOREIGN KEY ("candidature_id") REFERENCES "candidatures"("id") ON UPDATE NO ACTION ON DELETE SET NULL
);
  ALTER TABLE "inscriptions"
    ADD CONSTRAINT "inscriptions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions_admission"("id") ON UPDATE NO ACTION ON DELETE SET NULL;
CREATE UNIQUE INDEX "unique_apprenant_formation" ON "inscriptions"("apprenant_id", "formation_id");
CREATE UNIQUE INDEX "inscriptions_candidature_id_key" ON "inscriptions"("candidature_id");
CREATE INDEX "idx_inscriptions_apprenant_statut" ON "inscriptions"("apprenant_id", "statut");
  CREATE INDEX "idx_inscriptions_session" ON "inscriptions"("session_id");

CREATE TABLE "validations_niveau" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "apprenant_id" UUID NOT NULL,
    "niveau_id" UUID NOT NULL,
    "filiere_id" UUID NOT NULL,
    "certificat_id" UUID,
    "date_validation" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "validations_niveau_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "validations_niveau_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "apprenants"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "validations_niveau_niveau_id_fkey" FOREIGN KEY ("niveau_id") REFERENCES "niveaux"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "validations_niveau_filiere_id_fkey" FOREIGN KEY ("filiere_id") REFERENCES "filieres"("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT "validations_niveau_certificat_id_fkey" FOREIGN KEY ("certificat_id") REFERENCES "certificats"("id") ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE UNIQUE INDEX "validations_niveau_apprenant_id_niveau_id_filiere_id_key" ON "validations_niveau"("apprenant_id", "niveau_id", "filiere_id");

CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nom" VARCHAR(150) NOT NULL,
    "telephone" VARCHAR(40) NOT NULL,
    "filiere" VARCHAR(255),
    "message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- Référentiel OFPPT-like
INSERT INTO "niveaux" ("code", "libelle", "ordre") VALUES
  ('SPEC', 'Spécialisation', 1),
  ('QUAL', 'Qualification', 2),
  ('TECH', 'Technicien', 3),
  ('TECH_SPEC', 'Technicien Spécialisé', 4)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "filieres" ("code", "libelle", "ordre") VALUES
  ('MECA', 'Mécanique', 1),
  ('ELEC', 'Électricité', 2),
  ('INFO', 'Informatique', 3),
  ('BTP', 'Bâtiment et travaux publics', 4),
  ('GEST', 'Gestion et administration', 5)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "formations_referentiel" ("filiere_id", "niveau_id", "libelle")
SELECT f.id, n.id, f.libelle || ' — ' || n.libelle
FROM "filieres" f CROSS JOIN "niveaux" n
ON CONFLICT ("filiere_id", "niveau_id") DO NOTHING;

INSERT INTO "prerequis_niveaux" ("niveau_cible_id", "niveau_requis_id")
SELECT c.id, r.id FROM "niveaux" c, "niveaux" r
WHERE (c.code = 'QUAL' AND r.code = 'SPEC')
   OR (c.code = 'TECH' AND r.code = 'QUAL')
   OR (c.code = 'TECH_SPEC' AND r.code = 'TECH')
ON CONFLICT ("niveau_cible_id", "niveau_requis_id") DO NOTHING;

-- Hub-and-spoke : siège = centre mère
UPDATE "etablissements" SET
  "type_etablissement" = 'MERE',
  "parent_etablissement_id" = NULL
WHERE "id" = (
  SELECT u."etablissement_id" FROM "utilisateurs" u
  WHERE u."role" = 'ADMIN_CENTRE'
  ORDER BY u."created_at" ASC NULLS LAST
  LIMIT 1
);

UPDATE "etablissements" SET "type_etablissement" = 'MERE'
WHERE "type_etablissement" <> 'MERE'
  AND NOT EXISTS (SELECT 1 FROM "etablissements" e2 WHERE e2."type_etablissement" = 'MERE')
  AND "id" = (SELECT "id" FROM "etablissements" ORDER BY "created_at" ASC NULLS LAST LIMIT 1);

UPDATE "etablissements" e SET
  "parent_etablissement_id" = (SELECT "id" FROM "etablissements" WHERE "type_etablissement" = 'MERE' LIMIT 1)
WHERE e."type_etablissement" <> 'MERE';

INSERT INTO "parametres_reseau" ("etablissement_mere_id", "politique_concurrente")
SELECT "id", 'MISE_EN_RESERVE' FROM "etablissements" WHERE "type_etablissement" = 'MERE'
ON CONFLICT ("etablissement_mere_id") DO NOTHING;

-- Identité réseau pour apprenants existants
INSERT INTO "apprenants" (
  "matricule", "nom", "prenom", "email", "utilisateur_id", "etablissement_origine_id"
)
SELECT
  'VIT-' || TO_CHAR(COALESCE(u."created_at", NOW()), 'YYYY') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY u."created_at"))::text, 6, '0'),
  u."nom",
  u."prenom",
  u."email",
  u."id",
  u."etablissement_id"
FROM "utilisateurs" u
WHERE u."role" = 'APPRENANT'
  AND NOT EXISTS (SELECT 1 FROM "apprenants" a WHERE a."utilisateur_id" = u."id" OR a."email" = u."email");

-- Inscriptions implicites : conserve l'accès LMS actuel
INSERT INTO "inscriptions" ("apprenant_id", "formation_id", "statut", "date_debut")
SELECT a."id", f."id", 'ACTIVE', COALESCE(u."created_at", NOW())
FROM "apprenants" a
JOIN "utilisateurs" u ON u."id" = a."utilisateur_id"
JOIN "formations" f ON f."etablissement_id" = u."etablissement_id"
ON CONFLICT ("apprenant_id", "formation_id") DO NOTHING;
