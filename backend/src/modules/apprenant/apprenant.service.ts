import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { Role } from '../../common/enums/role.enum';
import { PedagogieService } from '../pedagogie/pedagogie.service';
import { CertificationService } from '../certification/certification.service';

@Injectable()
export class ApprenantService {
  private readonly logger = new Logger(ApprenantService.name);
  private static readonly cache = new Map<string, { data: any; expiry: number }>();
  private static readonly DEFAULT_TTL_MS = 60 * 1000; // 60s TTL

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private pedagogieService: PedagogieService,
    private certificationService: CertificationService,
  ) {}

  /**
   * Helper pour gérer le cache mémoire ultra-rapide (< 1ms)
   */
  private getFromCache<T>(key: string): T | null {
    const entry = ApprenantService.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    ApprenantService.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttlMs = ApprenantService.DEFAULT_TTL_MS): T {
    ApprenantService.cache.set(key, { data, expiry: Date.now() + ttlMs });
    return data;
  }

  public invalidateUserCache(userId: string) {
    for (const key of ApprenantService.cache.keys()) {
      if (key.includes(userId)) {
        ApprenantService.cache.delete(key);
      }
    }
  }

  /**
   * Vérifie que l'utilisateur a le rôle APPRENANT
   */
  private assertApprenant(user: any) {
    if (user.role !== Role.APPRENANT) {
      throw new ForbiddenException('Accès réservé exclusivement aux apprenants.');
    }
  }

  private async formationFilterForUser(user: any): Promise<{ id?: { in: string[] }; etablissementId?: string }> {
    const profile = await this.prisma.apprenant.findUnique({ where: { utilisateurId: user.id } });
    if (!profile) {
      return { etablissementId: user.etablissementId };
    }
    const inscriptions = await this.prisma.inscription.findMany({
      where: { apprenantId: profile.id, statut: { in: ['ACTIVE', 'RESERVEE'] } },
      select: { formationId: true },
    });
    const ids = inscriptions.map((i) => i.formationId);
    if (!ids.length) {
      return { id: { in: ['00000000-0000-0000-0000-000000000000'] } };
    }
    return { id: { in: ids } };
  }

  private async assertFormationAccess(formationId: string, user: any) {
    const filter = await this.formationFilterForUser(user);
    if (filter.etablissementId) {
      const formation = await this.prisma.formation.findUnique({ where: { id: formationId } });
      if (!formation || formation.etablissementId !== user.etablissementId) {
        throw new ForbiddenException('BR-02 : Accès interdit à cette formation.');
      }
      return;
    }
    if (!filter.id?.in.includes(formationId)) {
      throw new ForbiddenException('BR-10 : Accès réservé aux formations auxquelles vous êtes inscrit.');
    }
  }

  /**
   * Dashboard Apprenant : agrégat KPIs, formations actives, prochaine échéance (Optimisé Batch Query + RAM Cache)
   */
  async getDashboard(user: any) {
    this.assertApprenant(user);
    const cacheKey = `dashboard:${user.id}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();

    // 1. Exécution en parallèle des requêtes principales indépendantes
    const [formations, devoirsSoumis, prochaineSeance, nbQuizPasses, nbCertificats] =
      await Promise.all([
        this.prisma.formation.findMany({
          where: await this.formationFilterForUser(user),
          include: {
            modules: {
              include: {
                cours: { select: { id: true } },
              },
            },
            certificats: {
              where: { utilisateurId: user.id },
              select: { id: true },
            },
          },
        }),
        this.prisma.soumissionDevoir.findMany({
          where: { apprenantId: user.id },
          select: { devoirId: true },
        }),
        this.prisma.seanceFormation.findFirst({
          where: {
            dateHeureDebut: { gte: now },
            module: { formation: { etablissementId: user.etablissementId } },
          },
          include: {
            module: { include: { formation: { select: { titre: true } } } },
            formateur: { select: { nom: true, prenom: true } },
          },
          orderBy: { dateHeureDebut: 'asc' },
        }),
        this.prisma.tentativeQuiz.count({
          where: { apprenantId: user.id },
        }),
        this.prisma.certificat.count({
          where: { utilisateurId: user.id },
        }),
      ]);

    // 2. Extraire tous les coursIds et moduleIds de toutes les formations
    const moduleIds = formations.flatMap((f) => f.modules.map((m) => m.id));
    const coursIds = formations.flatMap((f) => f.modules.flatMap((m) => m.cours.map((c) => c.id)));
    const devoirsSoumisIds = devoirsSoumis.map((s) => s.devoirId);
    const totalCours = coursIds.length;

    // 3. Charger progressions et prochain devoir en 1 seule étape parallèle ultra-rapide (index direct moduleId)
    const [completedProgress, prochainDevoir] = await Promise.all([
      coursIds.length > 0
        ? this.prisma.userProgress.findMany({
            where: {
              utilisateurId: user.id,
              coursId: { in: coursIds },
              complete: true,
            },
            select: { coursId: true },
          })
        : [],
      moduleIds.length > 0
        ? this.prisma.devoir.findFirst({
            where: {
              moduleId: { in: moduleIds },
              id: { notIn: devoirsSoumisIds },
              dateLimite: { gte: now },
            },
            include: {
              module: {
                include: { formation: { select: { id: true, titre: true } } },
              },
            },
            orderBy: { dateLimite: 'asc' },
          })
        : null,
    ]);

    const completedSet = new Set(completedProgress.map((p) => p.coursId));
    const completionGlobale =
      totalCours > 0 ? Math.round((completedSet.size / totalCours) * 100) : 0;

    // 5. Calcul des progressions par formation en mémoire (0ms CPU)
    const formationsResume = formations.map((f) => {
      const fCoursIds = f.modules.flatMap((m) => m.cours.map((c) => c.id));
      const fTotal = fCoursIds.length;
      const fCompleted = fCoursIds.filter((id) => completedSet.has(id)).length;
      const fPourcentage = fTotal > 0 ? Math.round((fCompleted / fTotal) * 100) : 0;
      const certif = f.certificats[0] || null;

      return {
        id: f.id,
        titre: f.titre,
        description: f.description,
        nbModules: f.modules.length,
        totalCours: fTotal,
        coursCompletes: fCompleted,
        pourcentage: fPourcentage,
        certifie: !!certif,
        certificatId: certif?.id ?? null,
      };
    });

    const result = {
      completionGlobale,
      formationsActives: formationsResume,
      nbFormations: formations.length,
      nbQuizPasses,
      nbDevoirsDeposes: devoirsSoumis.length,
      nbCertificats,
      prochaineEcheance: prochainDevoir
        ? {
            type: 'devoir',
            id: prochainDevoir.id,
            titre: prochainDevoir.titre,
            formationTitre: prochainDevoir.module.formation.titre,
            dateLimite: prochainDevoir.dateLimite,
          }
        : prochaineSeance
        ? {
            type: 'seance',
            id: prochaineSeance.id,
            titre: prochaineSeance.titreActivite,
            formationTitre: prochaineSeance.module.formation.titre,
            dateLimite: prochaineSeance.dateHeureDebut,
          }
        : null,
    };
    return this.setCache(cacheKey, result);
  }

  /**
   * Formations affectées / inscrites pour cet apprenant (Optimisé Batch Query + RAM Cache)
   */
  async getFormations(user: any) {
    this.assertApprenant(user);
    const cacheKey = `formations:${user.id}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const formations = await this.prisma.formation.findMany({
      where: await this.formationFilterForUser(user),
      include: {
        modules: {
          orderBy: { ordre: 'asc' },
          include: {
            cours: { select: { id: true } },
            quiz: { select: { id: true } },
            devoirs: { select: { id: true } },
          },
        },
        certificats: {
          where: { utilisateurId: user.id },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const allCoursIds: string[] = [];
    for (const f of formations) {
      for (const m of f.modules) {
        allCoursIds.push(...m.cours.map((c) => c.id));
      }
    }

    const completedProgress = allCoursIds.length > 0
      ? await this.prisma.userProgress.findMany({
          where: {
            utilisateurId: user.id,
            coursId: { in: allCoursIds },
            complete: true,
          },
          select: { coursId: true },
        })
      : [];
    const completedSet = new Set(completedProgress.map((p) => p.coursId));

    const result = formations.map((f) => {
      const fCoursIds = f.modules.flatMap((m) => m.cours.map((c) => c.id));
      const fTotal = fCoursIds.length;
      const fCompleted = fCoursIds.filter((id) => completedSet.has(id)).length;
      const fPourcentage = fTotal > 0 ? Math.round((fCompleted / fTotal) * 100) : 0;
      const certif = f.certificats[0] || null;

      return {
        id: f.id,
        titre: f.titre,
        description: f.description,
        createdAt: f.createdAt,
        nbModules: f.modules.length,
        totalCours: fTotal,
        coursCompletes: fCompleted,
        pourcentage: fPourcentage,
        estCertifie: !!certif,
        certificat: certif
          ? {
              id: certif.id,
              numeroSerie: certif.numeroSerie,
              dateEmission: certif.dateEmission,
            }
          : null,
      };
    });

    return this.setCache(cacheKey, result);
  }

  /**
   * Arborescence détaillée des modules / cours / quiz / devoirs d'une formation (Optimisé RAM Cache)
   */
  async getFormationModules(formationId: string, user: any) {
    this.assertApprenant(user);
    const cacheKey = `modules:${user.id}:${formationId}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const formation = await this.prisma.formation.findUnique({
      where: { id: formationId },
      include: {
        etablissement: { select: { id: true, nom: true, codeAntenne: true } },
        modules: {
          orderBy: { ordre: 'asc' },
          include: {
            cours: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                titre: true,
                contenu: true,
                fileUrl: true,
                createdAt: true,
              },
            },
            quiz: {
              select: {
                id: true,
                titre: true,
                dureeMinutes: true,
                tentatives: {
                  where: { apprenantId: user.id },
                  select: { id: true, score: true, datePassage: true },
                },
              },
            },
            devoirs: {
              select: {
                id: true,
                titre: true,
                consignes: true,
                dateLimite: true,
                soumissions: {
                  where: { apprenantId: user.id },
                  select: {
                    id: true,
                    fileUrl: true,
                    note: true,
                    commentaire: true,
                    dateDepot: true,
                  },
                },
              },
            },
            evaluations: {
              include: {
                notes: {
                  where: { utilisateurId: user.id },
                  select: { valeur: true, dateNotation: true },
                },
              },
            },
          },
        },
      },
    });

    if (!formation) {
      throw new NotFoundException('Formation introuvable.');
    }

    if (!formation) throw new NotFoundException('Formation introuvable.');
    await this.assertFormationAccess(formationId, user);

    // Récupérer les progressions de cours de l'utilisateur
    const progressions = await this.prisma.userProgress.findMany({
      where: { utilisateurId: user.id },
    });
    const progMap = new Map(progressions.map((p) => [p.coursId, p]));

    // Mapper les modules avec statuts de progression
    let totalFormationCours = 0;
    let completedFormationCours = 0;

    const modulesWithStatus = formation.modules.map((m) => {
      const coursList = m.cours.map((c) => {
        const p = progMap.get(c.id);
        const complete = p?.complete ?? false;
        if (complete) completedFormationCours++;
        totalFormationCours++;

        return {
          id: c.id,
          titre: c.titre,
          hasMedia: !!c.fileUrl,
          hasText: !!c.contenu,
          complete,
          dateTerminaison: p?.dateTerminaison ?? null,
        };
      });

      const totalModuleCours = coursList.length;
      const completedModuleCours = coursList.filter((c) => c.complete).length;
      const pourcentageModule =
        totalModuleCours > 0 ? Math.round((completedModuleCours / totalModuleCours) * 100) : 100;

      let statutModule: 'non_commence' | 'en_cours' | 'termine' = 'non_commence';
      if (pourcentageModule === 100 && totalModuleCours > 0) {
        statutModule = 'termine';
      } else if (pourcentageModule > 0) {
        statutModule = 'en_cours';
      }

      const quizList = m.quiz.map((q) => {
        const tentative = q.tentatives[0] || null;
        return {
          id: q.id,
          titre: q.titre,
          dureeMinutes: q.dureeMinutes,
          passe: !!tentative,
          score: tentative ? Number(tentative.score) : null,
          datePassage: tentative?.datePassage ?? null,
        };
      });

      const devoirsList = m.devoirs.map((d) => {
        const soumission = d.soumissions[0] || null;
        return {
          id: d.id,
          titre: d.titre,
          consignes: d.consignes,
          dateLimite: d.dateLimite,
          estEnRetard: d.dateLimite ? new Date() > d.dateLimite && !soumission : false,
          soumis: !!soumission,
          note: soumission?.note ? Number(soumission.note) : null,
          commentaire: soumission?.commentaire ?? null,
          dateDepot: soumission?.dateDepot ?? null,
        };
      });

      return {
        id: m.id,
        titre: m.titre,
        ordre: m.ordre,
        coefficient: Number(m.coefficient ?? 1),
        statut: statutModule,
        pourcentage: pourcentageModule,
        totalCours: totalModuleCours,
        completedCours: completedModuleCours,
        cours: coursList,
        quiz: quizList,
        devoirs: devoirsList,
      };
    });

    const progressionGlobale =
      totalFormationCours > 0
        ? Math.round((completedFormationCours / totalFormationCours) * 100)
        : 0;

    // Certificat existant
    const certificat = await this.prisma.certificat.findFirst({
      where: { utilisateurId: user.id, formationId: formation.id },
    });

    const result = {
      formation: {
        id: formation.id,
        titre: formation.titre,
        description: formation.description,
        etablissement: formation.etablissement,
        progressionGlobale,
        certificat: certificat
          ? {
              id: certificat.id,
              numeroSerie: certificat.numeroSerie,
              dateEmission: certificat.dateEmission,
            }
          : null,
      },
      modules: modulesWithStatus,
    };

    return this.setCache(cacheKey, result);
  }

  /**
   * Vérification de l'éligibilité au Certificat selon la règle BR-03
   * Condition : 100% de cours complétés + moyenne >= 10/20
   */
  async checkEligibiliteCertificat(formationId: string, user: any) {
    this.assertApprenant(user);
    const cacheKey = `eligibilite:${user.id}:${formationId}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const formation = await this.prisma.formation.findUnique({
      where: { id: formationId },
    });
    if (!formation) throw new NotFoundException('Formation introuvable.');
    if (!formation) throw new NotFoundException('Formation introuvable.');
    await this.assertFormationAccess(formationId, user);

    const [existingCert, progress, moyenne] = await Promise.all([
      this.prisma.certificat.findFirst({
        where: { formationId, utilisateurId: user.id },
      }),
      this.pedagogieService.getProgressByFormation(formationId, user.id),
      this.pedagogieService.getMoyennePonderee(formationId, user.id),
    ]);

    const completionOk = progress.completionRate >= 100;
    const moyenneOk = moyenne >= 10;
    const eligible = completionOk && moyenneOk;

    let raison: string | null = null;
    if (!completionOk) {
      raison = `Progression de cours incomplète (${progress.completionRate}% / 100%).`;
    } else if (!moyenneOk) {
      raison = `Moyenne générale insuffisante (${moyenne}/20 — minimum 10/20 requis).`;
    }

    const result = {
      eligible,
      completionRate: progress.completionRate,
      moyenne,
      raison,
      dejaEmis: !!existingCert,
      certificat: existingCert
        ? {
            id: existingCert.id,
            numeroSerie: existingCert.numeroSerie,
            dateEmission: existingCert.dateEmission,
            urlPdfS3: existingCert.urlPdfS3,
          }
        : null,
    };

    return this.setCache(cacheKey, result);
  }

  /**
   * Récupère le contenu d'un cours et l'URL du média (lecture sécurisée)
   */
  async getCoursContenu(coursId: string, user: any) {
    this.assertApprenant(user);
    const cacheKey = `cours:${user.id}:${coursId}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const cours = await this.prisma.cours.findUnique({
      where: { id: coursId },
      include: {
        module: {
          include: {
            formation: { select: { id: true, titre: true, etablissementId: true } },
          },
        },
      },
    });

    if (!cours) throw new NotFoundException('Cours introuvable.');
    await this.assertFormationAccess(cours.module.formation.id, user);

    const progress = await this.prisma.userProgress.findUnique({
      where: { utilisateurId_coursId: { utilisateurId: user.id, coursId } },
    });

    const result = {
      id: cours.id,
      titre: cours.titre,
      contenu: cours.contenu,
      fileUrl: cours.fileUrl,
      module: {
        id: cours.module.id,
        titre: cours.module.titre,
      },
      formation: cours.module.formation,
      complete: progress?.complete ?? false,
      dateTerminaison: progress?.dateTerminaison ?? null,
    };

    return this.setCache(cacheKey, result);
  }

  /**
   * Marquer un cours comme terminé (déclenche recalcul de la progression et invalidation cache)
   */
  async markCoursProgression(coursId: string, user: any) {
    this.assertApprenant(user);

    const cours = await this.prisma.cours.findUnique({
      where: { id: coursId },
      include: { module: { select: { id: true, formationId: true, formation: true } } },
    });

    if (!cours) throw new NotFoundException('Cours introuvable.');
    await this.assertFormationAccess(cours.module.formation.id, user);

    const updated = await this.prisma.userProgress.upsert({
      where: { utilisateurId_coursId: { utilisateurId: user.id, coursId } },
      update: { complete: true, dateTerminaison: new Date() },
      create: { utilisateurId: user.id, coursId, complete: true, dateTerminaison: new Date() },
    });

    // Invalidation immédiate du cache utilisateur
    this.invalidateUserCache(user.id);

    // Recalcul du pourcentage de la formation
    const progress = await this.pedagogieService.getProgressByFormation(
      cours.module.formationId,
      user.id,
    );

    // Déclenchement automatique de la certification BR-03 si 100% complété et moyenne >= 10/20
    const autoCert = await this.triggerAutoCertification(cours.module.formationId, user.id);

    return {
      success: true,
      coursId,
      complete: updated.complete,
      dateTerminaison: updated.dateTerminaison,
      formationProgress: progress,
      certificatEmis: autoCert ? true : false,
    };
  }

  /**
   * Auto-délivrance ministérielle du certificat (Règle BR-03)
   * Déclenche la création du certificat, génération PDF et signature numérique SHA-256
   */
  private async triggerAutoCertification(formationId: string, utilisateurId: string) {
    try {
      const existingCert = await this.prisma.certificat.findFirst({
        where: { formationId, utilisateurId },
      });
      if (existingCert) return existingCert;

      const progress = await this.pedagogieService.getProgressByFormation(formationId, utilisateurId);
      if (progress.completionRate < 100) return null;

      const moyenne = await this.pedagogieService.getMoyennePonderee(formationId, utilisateurId);
      if (moyenne < 10) return null;

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const result = await this.certificationService.emettreCertificat(formationId, utilisateurId, baseUrl);
      this.logger.log(`[Auto-Certification BR-03] Certificat émis avec succès pour l'utilisateur ${utilisateurId} (Formation: ${formationId})`);
      this.invalidateUserCache(utilisateurId);
      return result;
    } catch (err: any) {
      this.logger.warn(`[Auto-Certification BR-03] Notice non-bloquante: ${err?.message}`);
      return null;
    }
  }

  /**
   * Récupère un quiz sans les bonnes réponses (Sécurité anti-triche côté client)
   */
  async getQuiz(quizId: string, user: any) {
    this.assertApprenant(user);

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        module: { include: { formation: true } },
        questions: { orderBy: { ordre: 'asc' } },
        tentatives: {
          where: { apprenantId: user.id },
          select: { id: true, score: true, datePassage: true, reponses: true },
        },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz introuvable.');
    await this.assertFormationAccess(quiz.module.formation.id, user);

    const tentative = quiz.tentatives[0] || null;

    // Masquer les champs `correct` des options envoyées au frontend
    const sanitizedQuestions = quiz.questions.map((q) => {
      const optionsRaw = Array.isArray(q.options) ? q.options : [];
      return {
        id: q.id,
        enonce: q.enonce,
        ordre: q.ordre,
        options: optionsRaw.map((opt: any) => ({
          text: opt.text ?? opt.texte ?? '',
        })),
      };
    });

    return {
      id: quiz.id,
      titre: quiz.titre,
      dureeMinutes: quiz.dureeMinutes,
      moduleId: quiz.moduleId,
      formationTitre: quiz.module.formation.titre,
      totalQuestions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
      tentative: tentative
        ? {
            id: tentative.id,
            score: Number(tentative.score),
            datePassage: tentative.datePassage,
            dejaPasse: true,
          }
        : null,
    };
  }

  /**
   * Soumettre un quiz et calcul de score exclusivement côté serveur
   */
  async submitQuiz(
    quizId: string,
    reponses: { questionId: string; selectedIndex: number }[],
    user: any,
  ) {
    this.assertApprenant(user);

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: { orderBy: { ordre: 'asc' } },
        module: { include: { formation: true } },
      },
    });

    if (!quiz) throw new NotFoundException('Quiz introuvable.');
    await this.assertFormationAccess(quiz.module.formation.id, user);

    const existing = await this.prisma.tentativeQuiz.findUnique({
      where: { quizId_apprenantId: { quizId, apprenantId: user.id } },
    });
    if (existing) {
      throw new BadRequestException('Vous avez déjà soumis ce quiz. Une seule tentative est autorisée.');
    }

    // Calcul de score étanche côté serveur
    let bonnesReponses = 0;
    const totalQuestions = quiz.questions.length;

    const detailsCorrection = quiz.questions.map((q) => {
      const rep = reponses.find((r) => r.questionId === q.id);
      const opts = Array.isArray(q.options) ? (q.options as any[]) : [];
      const userSelected = rep !== undefined ? rep.selectedIndex : -1;
      const isCorrect = userSelected >= 0 && opts[userSelected]?.correct === true;

      if (isCorrect) {
        bonnesReponses++;
      }

      return {
        questionId: q.id,
        enonce: q.enonce,
        selectedIndex: userSelected,
        estCorrect: isCorrect,
      };
    });

    const score = totalQuestions > 0 ? Math.round((bonnesReponses / totalQuestions) * 10000) / 100 : 0;

    const tentative = await this.prisma.tentativeQuiz.create({
      data: {
        quizId,
        apprenantId: user.id,
        score,
        reponses: reponses as any,
      },
    });

    // Déclenchement automatique de la certification BR-03 si conditions remplies
    const autoCert = await this.triggerAutoCertification(quiz.module.formationId, user.id);

    // Invalider le cache pour actualiser le dashboard et les modules
    this.invalidateUserCache(user.id);

    return {
      success: true,
      tentativeId: tentative.id,
      score,
      bonnesReponses,
      totalQuestions,
      datePassage: tentative.datePassage,
      detailsCorrection,
      certificatEmis: autoCert ? true : false,
    };
  }

  /**
   * Dépôt d'un devoir par l'apprenant (upload multipart)
   */
  async deposerDevoir(devoirId: string, file: Express.Multer.File, user: any) {
    this.assertApprenant(user);

    if (!file) {
      throw new BadRequestException('Veuillez fournir un fichier pour le devoir.');
    }

    const devoir = await this.prisma.devoir.findUnique({
      where: { id: devoirId },
      include: { module: { include: { formation: true } } },
    });

    if (!devoir) throw new NotFoundException('Devoir introuvable.');
    await this.assertFormationAccess(devoir.module.formation.id, user);

    if (devoir.dateLimite && new Date() > devoir.dateLimite) {
      throw new BadRequestException('La date limite pour déposer ce devoir est dépassée.');
    }

    const fileUrl = await this.storage.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'devoirs',
    );

    const soumission = await this.prisma.soumissionDevoir.upsert({
      where: { devoirId_apprenantId: { devoirId, apprenantId: user.id } },
      update: {
        fileUrl,
        dateDepot: new Date(),
      },
      create: {
        devoirId,
        apprenantId: user.id,
        fileUrl,
      },
    });

    // Invalider le cache
    this.invalidateUserCache(user.id);

    return {
      success: true,
      soumissionId: soumission.id,
      devoirId,
      fileUrl: soumission.fileUrl,
      dateDepot: soumission.dateDepot,
    };
  }

  /**
   * Liste des certificats obtenus par l'apprenant (Optimisé RAM Cache)
   */
  async getCertificats(user: any) {
    this.assertApprenant(user);
    const cacheKey = `certificats:${user.id}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const certificats = await this.prisma.certificat.findMany({
      where: { utilisateurId: user.id },
      include: {
        formation: {
          select: {
            id: true,
            titre: true,
            description: true,
            etablissement: { select: { nom: true, codeAntenne: true } },
          },
        },
      },
      orderBy: { dateEmission: 'desc' },
    });

    const result = certificats.map((c) => ({
      id: c.id,
      numeroSerie: c.numeroSerie,
      hashVerification: c.hashVerification,
      moyenneGenerale: Number(c.moyenneGenerale),
      dateEmission: c.dateEmission,
      urlPdfS3: c.urlPdfS3,
      formation: c.formation,
    }));

    return this.setCache(cacheKey, result);
  }

  /**
   * GET /apprenant/devoirs — Agrégat optimisé : TOUS les devoirs en UNE SEULE requête SQL
   * Remplace les N+1 boucles séquentielles du frontend (x10+ plus rapide)
   */
  async getAllDevoirs(user: any) {
    this.assertApprenant(user);
    const cacheKey = `devoirs:${user.id}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const devoirs = await this.prisma.devoir.findMany({
      where: {
        module: {
          formation: {
            etablissementId: user.etablissementId,
          },
        },
      },
      include: {
        module: {
          select: {
            id: true,
            titre: true,
            formation: {
              select: { id: true, titre: true },
            },
          },
        },
        soumissions: {
          where: { apprenantId: user.id },
          select: {
            id: true,
            fileUrl: true,
            note: true,
            commentaire: true,
            dateDepot: true,
          },
        },
      },
      orderBy: [{ dateLimite: 'asc' }],
    });

    const result = devoirs.map((d) => {
      const soumission = d.soumissions[0] || null;
      return {
        id: d.id,
        titre: d.titre,
        consignes: d.consignes,
        dateLimite: d.dateLimite,
        moduleTitre: d.module.titre,
        formationId: d.module.formation.id,
        formationTitre: d.module.formation.titre,
        soumission: soumission
          ? {
              id: soumission.id,
              fileUrl: soumission.fileUrl,
              note: soumission.note !== null ? Number(soumission.note) : null,
              commentaire: soumission.commentaire,
              dateDepot: soumission.dateDepot,
            }
          : null,
      };
    });

    return this.setCache(cacheKey, result, 60_000);
  }

  /**
   * Télécharger / récupérer le PDF d'un certificat
   */
  async getCertificatPdf(certificatId: string, user: any) {
    this.assertApprenant(user);

    const certificat = await this.prisma.certificat.findUnique({
      where: { id: certificatId },
    });

    if (!certificat) throw new NotFoundException('Certificat introuvable.');
    if (certificat.utilisateurId !== user.id) {
      throw new ForbiddenException('Accès non autorisé à ce certificat.');
    }

    return {
      id: certificat.id,
      numeroSerie: certificat.numeroSerie,
      urlPdf: certificat.urlPdfS3,
    };
  }
}
