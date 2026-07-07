-- Migration: Quiz et Devoirs (V1 — moteur d'évaluation)
-- Appliquer après migration initiale : npx prisma migrate deploy

CREATE TABLE IF NOT EXISTS "quiz" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "module_id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "duree_minutes" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "questions_quiz" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "quiz_id" UUID NOT NULL,
    "enonce" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "options" JSONB NOT NULL,
    CONSTRAINT "questions_quiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tentatives_quiz" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "quiz_id" UUID NOT NULL,
    "apprenant_id" UUID NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "reponses" JSONB,
    "date_passage" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tentatives_quiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "devoirs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "module_id" UUID NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "consignes" TEXT,
    "date_limite" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "devoirs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "soumissions_devoirs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "devoir_id" UUID NOT NULL,
    "apprenant_id" UUID NOT NULL,
    "file_url" VARCHAR(512) NOT NULL,
    "date_depot" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" DECIMAL(4,2),
    "commentaire" TEXT,
    CONSTRAINT "soumissions_devoirs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tentatives_quiz_quiz_id_apprenant_id_key" ON "tentatives_quiz"("quiz_id", "apprenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "soumissions_devoirs_devoir_id_apprenant_id_key" ON "soumissions_devoirs"("devoir_id", "apprenant_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_module" ON "quiz"("module_id");
CREATE INDEX IF NOT EXISTS "idx_devoirs_module" ON "devoirs"("module_id");

ALTER TABLE "quiz" ADD CONSTRAINT "quiz_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "questions_quiz" ADD CONSTRAINT "questions_quiz_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "tentatives_quiz" ADD CONSTRAINT "tentatives_quiz_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quiz"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "tentatives_quiz" ADD CONSTRAINT "tentatives_quiz_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "devoirs" ADD CONSTRAINT "devoirs_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "soumissions_devoirs" ADD CONSTRAINT "soumissions_devoirs_devoir_id_fkey" FOREIGN KEY ("devoir_id") REFERENCES "devoirs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "soumissions_devoirs" ADD CONSTRAINT "soumissions_devoirs_apprenant_id_fkey" FOREIGN KEY ("apprenant_id") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
