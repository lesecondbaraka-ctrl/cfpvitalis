import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class PedagogieService {
  constructor(private prisma: PrismaService) {}

  // ====================================
  // FORMATIONS
  // ====================================
  async getFormations(user: any) {
    const where = user.role === Role.ADMIN_CENTRE
      ? {}
      : { etablissementId: user.etablissementId };
    return this.prisma.formation.findMany({
      where,
      include: { modules: { include: { _count: { select: { cours: true } } } }, etablissement: { select: { nom: true } } },
      orderBy: { titre: 'asc' },
    });
  }

  async getFormation(id: string, user: any) {
    const formation = await this.prisma.formation.findUnique({
      where: { id },
      include: {
        modules: { include: { cours: true } },
        etablissement: { select: { nom: true } },
      },
    });
    if (!formation) throw new NotFoundException('Formation introuvable.');

    // BR-02 : Souveraineté des données - un non-admin ne voit que ses formations
    if (user.role !== Role.ADMIN_CENTRE && formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Vous ne pouvez pas accéder aux formations d\'un autre établissement.');
    }
    return formation;
  }

  async createFormation(data: { titre: string; description: string }, user: any) {
    return this.prisma.formation.create({
      data: {
        titre: data.titre,
        description: data.description,
        etablissementId: user.etablissementId,
      },
    });
  }

  async updateFormation(id: string, data: { titre?: string; description?: string }, user: any) {
    const formation = await this.getFormation(id, user);
    // BR-02 : Seul l'établissement d'origine peut modifier
    if (user.role !== Role.ADMIN_CENTRE && formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Modification interdite pour un établissement tiers.');
    }
    return this.prisma.formation.update({ where: { id }, data });
  }

  // ====================================
  // MODULES
  // ====================================
  async createModule(formationId: string, data: { titre: string; coefficient?: number; ordre?: number }, user: any) {
    await this.getFormation(formationId, user); // Vérifie BR-02
    let ordre = data.ordre;
    if (ordre === undefined) {
      const maxOrdre = await this.prisma.module.aggregate({
        where: { formationId },
        _max: { ordre: true },
      });
      ordre = (maxOrdre._max.ordre ?? 0) + 1;
    }
    return this.prisma.module.create({
      data: {
        titre: data.titre,
        coefficient: data.coefficient ?? 1.0,
        ordre,
        formationId,
      },
    });
  }

  // ====================================
  // COURS
  // ====================================
  async createCours(moduleId: string, data: { titre: string; contenu?: string; fileUrl?: string }, user: any) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { formation: true },
    });
    if (!mod) throw new NotFoundException('Module introuvable.');
    // BR-02
    if (user.role !== Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Ajout de cours interdit pour un établissement tiers.');
    }
    return this.prisma.cours.create({ data: { ...data, moduleId } });
  }

  async getCours(id: string) {
    const cours = await this.prisma.cours.findUnique({
      where: { id },
      include: { module: { include: { formation: true } } },
    });
    if (!cours) throw new NotFoundException('Cours introuvable.');
    return cours;
  }

  // ====================================
  // PROGRESSION APPRENANT
  // ====================================
  async markComplete(coursId: string, userId: string) {
    return this.prisma.userProgress.upsert({
      where: { utilisateurId_coursId: { utilisateurId: userId, coursId } },
      update: { complete: true },
      create: { utilisateurId: userId, coursId, complete: true },
    });
  }

  async getProgressByFormation(formationId: string, userId: string) {
    const formation = await this.prisma.formation.findUnique({
      where: { id: formationId },
      include: { modules: { include: { cours: true } } },
    });
    if (!formation) throw new NotFoundException('Formation introuvable.');

    const allCoursIds = formation.modules.flatMap(m => m.cours.map(c => c.id));
    const obligatoireCoursIds = formation.modules
      .filter(m => m.coefficient === null || Number(m.coefficient) > 0)
      .flatMap(m => m.cours.map(c => c.id));

    const progress = await this.prisma.userProgress.findMany({
      where: { utilisateurId: userId, coursId: { in: allCoursIds }, complete: true },
    });

    const completedIds = new Set(progress.map(p => p.coursId));
    const totalObligatoire = obligatoireCoursIds.length;
    const completedObligatoire = obligatoireCoursIds.filter(id => completedIds.has(id)).length;

    return {
      totalCours: allCoursIds.length,
      totalObligatoire,
      completedObligatoire,
      completionRate: totalObligatoire > 0 ? Math.round((completedObligatoire / totalObligatoire) * 100) : 0,
    };
  }

  // ====================================
  // EVALUATIONS & NOTES
  // ====================================
  async createEvaluation(moduleId: string, data: { titre: string; noteMaximale?: number }, user: any) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { formation: true },
    });
    if (!mod) throw new NotFoundException('Module introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Création d\'évaluation interdite.');
    }
    return this.prisma.evaluation.create({
      data: { titre: data.titre, moduleId, noteMaximale: data.noteMaximale ?? 20 },
    });
  }

  async getEvaluationsByModule(moduleId: string, user: any) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { formation: true, evaluations: { include: { notes: true } } },
    });
    if (!mod) throw new NotFoundException('Module introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return mod.evaluations;
  }

  async getApprenants(user: any) {
    const where = user.role === Role.ADMIN_CENTRE
      ? { role: Role.APPRENANT, actif: true }
      : { etablissementId: user.etablissementId, role: Role.APPRENANT, actif: true };
    return this.prisma.utilisateur.findMany({
      where,
      select: { id: true, nom: true, prenom: true, email: true, etablissementId: true },
      orderBy: { nom: 'asc' },
    });
  }

  async getCoursWithProgress(coursId: string, userId: string) {
    const cours = await this.getCours(coursId);
    const progress = await this.prisma.userProgress.findUnique({
      where: { utilisateurId_coursId: { utilisateurId: userId, coursId } },
    });
    return { ...cours, complete: progress?.complete ?? false };
  }

  async uploadCoursDocument(coursId: string, fileUrl: string, user: any) {
    const cours = await this.getCours(coursId);
    if (user.role !== Role.ADMIN_CENTRE && cours.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Upload interdit.');
    }
    return this.prisma.cours.update({ where: { id: coursId }, data: { fileUrl } });
  }

  async deleteFormation(id: string, user: any) {
    await this.getFormation(id, user);
    return this.prisma.formation.delete({ where: { id } });
  }

  async submitNote(evaluationId: string, userId: string, valeur: number, auteurId: string, ipAdresse: string) {
    // Récupérer l'ancienne note si elle existe pour l'état avant
    const oldNote = await this.prisma.note.findUnique({
      where: { evaluationId_utilisateurId: { evaluationId, utilisateurId: userId } },
    });

    const oldNoteVal = oldNote ? oldNote.valeur : null;

    const result = await this.prisma.note.upsert({
      where: { evaluationId_utilisateurId: { evaluationId, utilisateurId: userId } },
      update: { valeur },
      create: { utilisateurId: userId, evaluationId, valeur, formateurId: auteurId },
    });

    // Journaliser dans AuditLog (Exigence de traçabilité immuable avec états avant/après)
    await this.prisma.auditLog.create({
      data: {
        auteurId,
        action: 'SAISIE_NOTE',
        details: {
          userId,
          evaluationId,
          etatAvant: oldNoteVal !== null ? `${oldNoteVal}/20` : 'Aucune',
          etatApres: `${valeur}/20`,
        },
        ipAdresse,
      },
    });

    return result;
  }

  /**
   * BR-03 : Calcule la moyenne pondérée d'un apprenant pour une formation.
   * Moyenne = Σ(note * coefficient) / Σ(coefficient)
   */
  async getMoyennePonderee(formationId: string, userId: string): Promise<number> {
    const modules = await this.prisma.module.findMany({
      where: { formationId },
      include: {
        evaluations: {
          include: {
            notes: { where: { utilisateurId: userId } },
          },
        },
      },
    });

    let totalPoids = 0;
    let totalPondere = 0;

    for (const mod of modules) {
      for (const evaluation of mod.evaluations) {
        if (evaluation.notes.length > 0) {
          const note = evaluation.notes[0];
          const noteVal = Number(note.valeur);
          const coeff = Number(mod.coefficient ?? 1);
          totalPondere += noteVal * coeff;
          totalPoids += coeff;
        }
      }
    }

    return totalPoids > 0 ? Math.round((totalPondere / totalPoids) * 100) / 100 : 0;
  }
}
