# LIV-06 — Procès-Verbal de Recette Finale

## Critères d'acceptation industriels

### Test d'étanchéité Multi-Tenant (BR-02)
- [x] EtablissementGuard sur routes sensibles
- [x] Filtrage par `etablissementId` dans services pédagogie/séances
- [x] AuditLog sur actions souveraines
- [x] Test automatisé inter-établissements (`test/app.e2e-spec.ts` — BR-02)

### Test Moteur Anti-Fraude (BR-03/BR-04)
- [x] Émission automatique si complétion 100% + moyenne ≥ 10/20
- [x] Numéro de série `CERT-YYYY-XXXXX` incrémental
- [x] PDF avec filigrane + QR Code de vérification
- [x] Route publique `/api/certification/verifier/:numeroSerie`

### Performance
- [x] Génération PDF via PDFKit (< 1500 ms en conditions normales)
- [x] Index SQL sur tables KPI

### Livrables
- [x] LIV-01 DAT
- [x] LIV-02 Schéma BDD + migrations
- [x] LIV-03 Charte graphique
- [x] LIV-04 Code source + tests
- [x] LIV-05 Manuels utilisateurs
- [x] LIV-06 PV Recette (présent document)

## Signature

| Partie | Nom | Date | Mention |
|--------|-----|------|---------|
| Maître d'Ouvrage — Vitalis Center EUP | | | Lu et approuvé |
| Maître d'Œuvre — KBL Service | | | Lu et approuvé |

Date d'émission : 07 juillet 2026
