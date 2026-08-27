-- Migration: create refresh_tokens table

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  token varchar(512) NOT NULL UNIQUE,
  utilisateur_id uuid NOT NULL,
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS refresh_tokens
  ADD CONSTRAINT fk_refresh_tokens_utilisateur
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_utilisateur ON refresh_tokens(utilisateur_id);
