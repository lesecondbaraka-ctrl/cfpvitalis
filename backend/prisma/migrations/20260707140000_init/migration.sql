-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "statut_presence" AS ENUM ('PRESENT', 'ABSENT', 'RETARD', 'JUSTIFIE');

-- CreateEnum
CREATE TYPE "type_seance" AS ENUM ('THEORIQUE', 'PRATIQUE', 'ATELIER', 'EVALUATION');

-- CreateEnum
CREATE TYPE "utilisateur_role" AS ENUM ('ADMIN_CENTRE', 'ADMIN_ETABLISSEMENT', 'FORMATEUR', 'PERSONNEL_ADMINISTRATIF', 'APPRENANT');

-- CreateTable
CREATE TABLE "certificats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "apprenant_id" UUID NOT NULL,
    "formation_id" UUID NOT NULL,
    "numero_serie" VARCHAR(50) NOT NULL,
    "hash_verification" VARCHAR(64) NOT NULL,
    "url_pdf_s3" VARCHAR(512) NOT NULL,
    "moyenne_generale" DECIMAL(4,2) NOT NULL,
    "date_emission" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cours" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "module_id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "contenu_text" TEXT,
    "url_document_s3" VARCHAR(512),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etablissements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nom" VARCHAR(255) NOT NULL,
    "code_antenne" VARCHAR(50) NOT NULL,
    "adresse" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "etablissements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "module_id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "note_maximale" DECIMAL(4,2) DEFAULT 20.00,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "etablissement_id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "formation_id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "ordre" INTEGER NOT NULL,
    "coefficient" DECIMAL(4,2) DEFAULT 1.00,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "evaluation_id" UUID NOT NULL,
    "apprenant_id" UUID NOT NULL,
    "formateur_id" UUID NOT NULL,
    "note_obtenue" DECIMAL(4,2) NOT NULL,
    "date_notation" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presences_seances" (
    "seance_id" UUID NOT NULL,
    "apprenant_id" UUID NOT NULL,
    "statut" "statut_presence" NOT NULL DEFAULT 'ABSENT',
    "remarque_justification" TEXT,
    "mis_a_jour_a" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presences_seances_pkey" PRIMARY KEY ("seance_id","apprenant_id")
);

-- CreateTable
CREATE TABLE "progression_cours" (
    "apprenant_id" UUID NOT NULL,
    "cours_id" UUID NOT NULL,
    "termine" BOOLEAN DEFAULT false,
    "date_terminaison" TIMESTAMPTZ(6),

    CONSTRAINT "progression_cours_pkey" PRIMARY KEY ("apprenant_id","cours_id")
);

-- CreateTable
CREATE TABLE "seances_formation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "module_id" UUID NOT NULL,
    "cours_id" UUID,
    "formateur_id" UUID NOT NULL,
    "titre_activite" VARCHAR(255) NOT NULL,
    "type_session" "type_seance" NOT NULL DEFAULT 'THEORIQUE',
    "date_heure_debut" TIMESTAMPTZ(6) NOT NULL,
    "date_heure_fin" TIMESTAMPTZ(6) NOT NULL,
    "salle_ou_lien" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seances_formation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_audit" (
    "id" BIGSERIAL NOT NULL,
    "timestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "adresse_ip" VARCHAR(45) NOT NULL,
    "utilisateur_id" UUID,
    "action_effectuee" VARCHAR(100) NOT NULL,
    "table_cible" VARCHAR(100) NOT NULL DEFAULT 'inconnue',
    "etat_apres" JSONB,
    "etat_avant" JSONB,

    CONSTRAINT "table_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "etablissement_id" UUID NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe_hash" VARCHAR(255) NOT NULL,
    "role" "utilisateur_role" NOT NULL,
    "est_actif" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certificats_numero_serie_key" ON "certificats"("numero_serie");

-- CreateIndex
CREATE UNIQUE INDEX "certificats_hash_verification_key" ON "certificats"("hash_verification");

-- CreateIndex
CREATE INDEX "idx_certificats_apprenant" ON "certificats"("apprenant_id");

-- CreateIndex
CREATE INDEX "idx_certificats_formation" ON "certificats"("formation_id");

-- CreateIndex
CREATE INDEX "idx_certificats_hash_anti_fraude" ON "certificats"("hash_verification");

-- CreateIndex
CREATE INDEX "idx_cours_module" ON "cours"("module_id");

-- CreateIndex
CREATE UNIQUE INDEX "etablissements_code_antenne_key" ON "etablissements"("code_antenne");

-- CreateIndex
CREATE INDEX "idx_evaluations_module" ON "evaluations"("module_id");

-- CreateIndex
CREATE INDEX "idx_formations_etablissement" ON "formations"("etablissement_id");

-- CreateIndex
CREATE INDEX "idx_modules_formation" ON "modules"("formation_id");

-- CreateIndex
CREATE INDEX "idx_notes_apprenant_evaluation" ON "notes"("apprenant_id", "evaluation_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_note_apprenant_evaluation" ON "notes"("evaluation_id", "apprenant_id");

-- CreateIndex
CREATE INDEX "idx_progression_apprenant_statut" ON "progression_cours"("apprenant_id", "termine");

-- CreateIndex
CREATE INDEX "idx_progression_cours_coursid" ON "progression_cours"("cours_id");

-- CreateIndex
CREATE INDEX "idx_seances_debut_fin" ON "seances_formation"("date_heure_debut", "date_heure_fin");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "idx_utilisateurs_etablissement" ON "utilisateurs"("etablissement_id");

-- AddForeignKey
ALTER TABLE "certificats" ADD CONSTRAINT "certificats_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "certificats" ADD CONSTRAINT "certificats_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cours" ADD CONSTRAINT "cours_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluations"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_formateur_id_fkey" FOREIGN KEY ("formateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presences_seances" ADD CONSTRAINT "presences_seances_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "presences_seances" ADD CONSTRAINT "presences_seances_seance_id_fkey" FOREIGN KEY ("seance_id") REFERENCES "seances_formation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "progression_cours" ADD CONSTRAINT "progression_cours_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "progression_cours" ADD CONSTRAINT "progression_cours_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances_formation" ADD CONSTRAINT "seances_formation_cours_id_fkey" FOREIGN KEY ("cours_id") REFERENCES "cours"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances_formation" ADD CONSTRAINT "seances_formation_formateur_id_fkey" FOREIGN KEY ("formateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "seances_formation" ADD CONSTRAINT "seances_formation_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "table_audit" ADD CONSTRAINT "table_audit_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "etablissements"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
