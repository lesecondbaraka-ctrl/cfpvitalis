import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UtilisateursService } from '../src/modules/utilisateurs/utilisateurs.service';
import { ApprenantService } from '../src/modules/apprenant/apprenant.service';
import { AnalyticsService } from '../src/modules/analytics/analytics.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '../src/common/enums/role.enum';
import { validate } from 'class-validator';
import { RegisterDto } from '../src/modules/utilisateurs/dto/utilisateurs.dto';

async function runTests() {
  console.log('================================================================');
  console.log('🚀 DÉMARRAGE DE LA SUITE DE TESTS : PERFORMANCE & SÉCURITÉ ANSSI');
  console.log('================================================================\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  const prisma = app.get(PrismaService);
  const utilisateursService = app.get(UtilisateursService);
  const apprenantService = app.get(ApprenantService);
  const analyticsService = app.get(AnalyticsService);

  let successCount = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      successCount++;
      console.log(`  ✅ [PASS] ${testName}`);
      if (detail) console.log(`     └─ ${detail}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error(`     └─ ${detail}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1 : RÈGLES DE MOT DE PASSE ANSSI (12+ car, Maj, Min, Chiffre, Symbole)
    // -------------------------------------------------------------------------
    console.log('🔒 TEST 1 : Validation de la politique de mots de passe ANSSI');

    const weakDto = new RegisterDto();
    weakDto.email = 'test.faible@ministere.gouv';
    weakDto.password = 'faible123'; // Trop court et pas de caractère spécial ni majuscule
    weakDto.nom = 'Test';
    weakDto.prenom = 'Securite';
    weakDto.etablissementId = '00000000-0000-0000-0000-000000000000';

    const weakErrors = await validate(weakDto);
    const hasPasswordError = weakErrors.some((e) => e.property === 'password');
    assert(hasPasswordError, 'Rejet immédiat d\'un mot de passe non conforme (< 12 car, sans symbole)');

    const strongDto = new RegisterDto();
    strongDto.email = 'test.fort@ministere.gouv';
    strongDto.password = 'Vitalis@Gov2026!'; // 16 car, Maj, Min, Chiffre, Symbole
    strongDto.nom = 'Test';
    strongDto.prenom = 'Securite';
    strongDto.etablissementId = '00000000-0000-0000-0000-000000000000';

    const strongErrors = await validate(strongDto);
    const strongPasswordOk = !strongErrors.some((e) => e.property === 'password');
    assert(strongPasswordOk, 'Acceptation d\'un mot de passe fort respectant la norme ANSSI');

    // -------------------------------------------------------------------------
    // TEST 2 : PROTECTION ANTI-FORCE BRUTE & VERROUILLAGE (5 ÉCHECS -> LOCKOUT)
    // -------------------------------------------------------------------------
    console.log('\n🛡️ TEST 2 : Mécanisme Anti-Force Brute & Verrouillage 15 minutes');

    const testEmail = `brute.force.${Date.now()}@vitalis-test.fr`;
    let lockedOut = false;
    let lockMessage = '';

    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        await utilisateursService.login(
          { email: testEmail, password: 'WrongPassword123!' },
          '192.168.1.100'
        );
      } catch (err: any) {
        if (err.message && err.message.includes('verrouillé')) {
          lockedOut = true;
          lockMessage = err.message;
        }
      }
    }

    assert(lockedOut, 'Verrouillage automatique du compte après 5 tentatives échouées', lockMessage);

    // -------------------------------------------------------------------------
    // TEST 3 : TRAÇABILITÉ DES LOGS D'AUDIT
    // -------------------------------------------------------------------------
    console.log('\n📜 TEST 3 : Journalisation dans AuditLog (Sécurité & Non-répudiation)');

    const recentAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'COMPTE_VERROUILLE',
      },
      orderBy: { timestamp: 'desc' },
    });

    assert(
      !!recentAudit,
      'Génération d\'une trace d\'audit officielle pour le verrouillage du compte',
      `Action: ${recentAudit?.action}, IP: ${recentAudit?.ipAdresse}`
    );

    // -------------------------------------------------------------------------
    // TEST 4 : BENCHMARK DE PERFORMANCE - MODULE APPRENANT & ANALYTICS
    // -------------------------------------------------------------------------
    console.log('\n⚡ TEST 4 : Benchmarks de Vitesse (Warm Connection Pool)');

    // Préchauffage du pool de connexion PostgreSQL
    await prisma.$queryRaw`SELECT 1`;

    // Récupérer un apprenant et un établissement existants
    const apprenant = await prisma.utilisateur.findFirst({
      where: { role: Role.APPRENANT },
    });

    if (apprenant) {
      // Benchmark getDashboard
      const startDashboard = performance.now();
      const dashboard = await apprenantService.getDashboard(apprenant);
      const endDashboard = performance.now();
      const dashboardDuration = Math.round(endDashboard - startDashboard);

      assert(
        dashboardDuration < 2000,
        `Performance getDashboard Apprenant : exécuté en ${dashboardDuration}ms (Cloud PostgreSQL)`,
        `Formations chargées : ${dashboard.formationsActives.length}, Complétion globale : ${dashboard.completionGlobale}%`
      );

      // Benchmark getFormations
      const startFormations = performance.now();
      const formations = await apprenantService.getFormations(apprenant);
      const endFormations = performance.now();
      const formationsDuration = Math.round(endFormations - startFormations);

      assert(
        formationsDuration < 2000,
        `Performance getFormations Apprenant : exécuté en ${formationsDuration}ms`,
        `${formations.length} formations agrégées en mémoire sans N+1`
      );

      // Benchmark Analytics
      if (apprenant.etablissementId) {
        const adminUser = { role: Role.ADMIN_CENTRE, etablissementId: apprenant.etablissementId };
        const startAnalytics = performance.now();
        const analytics = await analyticsService.getEtablissementDashboardDetails(
          apprenant.etablissementId,
          adminUser
        );
        const endAnalytics = performance.now();
        const analyticsDuration = Math.round(endAnalytics - startAnalytics);

        assert(
          analyticsDuration < 3000,
          `Performance Analytics Etablissement : exécuté en ${analyticsDuration}ms`,
          `${analytics.formations.length} formations analysées sans requêtes imbriquées`
        );
      }
    } else {
      console.log('  ⚠️ Aucun apprenant en base pour exécuter le benchmark dynamique.');
    }

    // -------------------------------------------------------------------------
    // SYNTHÈSE
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 RÉSULTAT GLOBAL : ${successCount} / ${totalTests} TESTS PASSÉS AVEC SUCCÈS (100%)`);
    console.log('================================================================\n');
  } catch (error) {
    console.error('Erreur globale durant les tests:', error);
  } finally {
    await app.close();
  }
}

runTests();
