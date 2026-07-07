-- Row Level Security — Vitalis Center EUP V3
-- À exécuter sur Supabase/PostgreSQL en production (auth.uid() requis)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE seances_formation ENABLE ROW LEVEL SECURITY;
ALTER TABLE presences_seances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS politique_lecture_seances ON seances_formation;
CREATE POLICY politique_lecture_seances ON seances_formation
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM utilisateurs
            WHERE utilisateurs.id = auth.uid()
            AND utilisateurs.etablissement_id = (
                SELECT formations.etablissement_id FROM modules
                JOIN formations ON formations.id = modules.formation_id
                WHERE modules.id = seances_formation.module_id
            )
        )
    );

DROP POLICY IF EXISTS politique_gestion_presences ON presences_seances;
CREATE POLICY politique_gestion_presences ON presences_seances
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM seances_formation sf
            WHERE sf.id = presences_seances.seance_id
            AND (sf.formateur_id = auth.uid() OR EXISTS (
                SELECT 1 FROM utilisateurs u
                WHERE u.id = auth.uid() AND u.role IN ('ADMIN_ETABLISSEMENT', 'ADMIN_CENTRE')
            ))
        )
    );
