import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  private async assertModuleAccess(moduleId: string, user: any) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { formation: true },
    });
    if (!mod) throw new NotFoundException('Module introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return mod;
  }

  async create(moduleId: string, data: { titre: string; dureeMinutes?: number; questions: { enonce: string; options: { text: string; correct: boolean }[] }[] }, user: any) {
    await this.assertModuleAccess(moduleId, user);
    const quiz = await this.prisma.quiz.create({
      data: {
        moduleId,
        titre: data.titre,
        dureeMinutes: data.dureeMinutes,
        questions: {
          create: data.questions.map((q, i) => ({
            enonce: q.enonce,
            ordre: i + 1,
            options: q.options,
          })),
        },
      },
      include: { questions: true },
    });
    return quiz;
  }

  async findByModule(moduleId: string, user: any) {
    await this.assertModuleAccess(moduleId, user);
    return this.prisma.quiz.findMany({
      where: { moduleId },
      include: { _count: { select: { questions: true, tentatives: true } } },
    });
  }

  async findOne(id: string, user: any, forApprenant = false) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        module: { include: { formation: true } },
        questions: { orderBy: { ordre: 'asc' } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && quiz.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    if (forApprenant) {
      return {
        ...quiz,
        questions: quiz.questions.map(q => ({
          id: q.id,
          enonce: q.enonce,
          ordre: q.ordre,
          options: (q.options as any[]).map(o => ({ text: o.text })),
        })),
      };
    }
    return quiz;
  }

  async submit(quizId: string, reponses: { questionId: string; selectedIndex: number }[], user: any) {
    if (user.role !== Role.APPRENANT) throw new ForbiddenException('Réservé aux apprenants.');
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true, module: { include: { formation: true } } },
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable.');
    if (quiz.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }

    const existing = await this.prisma.tentativeQuiz.findUnique({
      where: { quizId_apprenantId: { quizId, apprenantId: user.id } },
    });
    if (existing) throw new BadRequestException('Vous avez déjà passé ce quiz.');

    let correct = 0;
    const total = quiz.questions.length;
    for (const q of quiz.questions) {
      const rep = reponses.find(r => r.questionId === q.id);
      const opts = q.options as { text: string; correct: boolean }[];
      if (rep && opts[rep.selectedIndex]?.correct) correct++;
    }
    const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;

    return this.prisma.tentativeQuiz.create({
      data: {
        quizId,
        apprenantId: user.id,
        score,
        reponses: reponses as any,
      },
    });
  }

  async getMesTentatives(userId: string) {
    return this.prisma.tentativeQuiz.findMany({
      where: { apprenantId: userId },
      include: { quiz: { include: { module: { include: { formation: { select: { titre: true } } } } } } },
      orderBy: { datePassage: 'desc' },
    });
  }

  async update(id: string, data: { titre?: string; dureeMinutes?: number }, user: any) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { module: { include: { formation: true } } },
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && quiz.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.prisma.quiz.update({
      where: { id },
      data: {
        titre: data.titre,
        dureeMinutes: data.dureeMinutes,
      },
    });
  }

  async delete(id: string, user: any) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { module: { include: { formation: true } } },
    });
    if (!quiz) throw new NotFoundException('Quiz introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && quiz.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.prisma.quiz.delete({ where: { id } });
  }
}
