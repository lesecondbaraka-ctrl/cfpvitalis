"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../common/enums/role.enum");
let QuizService = class QuizService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async assertModuleAccess(moduleId, user) {
        const mod = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: { formation: true },
        });
        if (!mod)
            throw new common_1.NotFoundException('Module introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        return mod;
    }
    async create(moduleId, data, user) {
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
    async findByModule(moduleId, user) {
        await this.assertModuleAccess(moduleId, user);
        return this.prisma.quiz.findMany({
            where: { moduleId },
            include: { _count: { select: { questions: true, tentatives: true } } },
        });
    }
    async findOne(id, user, forApprenant = false) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            include: {
                module: { include: { formation: true } },
                questions: { orderBy: { ordre: 'asc' } },
            },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && quiz.module.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        if (forApprenant) {
            return {
                ...quiz,
                questions: quiz.questions.map(q => ({
                    id: q.id,
                    enonce: q.enonce,
                    ordre: q.ordre,
                    options: q.options.map(o => ({ text: o.text })),
                })),
            };
        }
        return quiz;
    }
    async submit(quizId, reponses, user) {
        if (user.role !== role_enum_1.Role.APPRENANT)
            throw new common_1.ForbiddenException('Réservé aux apprenants.');
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true, module: { include: { formation: true } } },
        });
        if (!quiz)
            throw new common_1.NotFoundException('Quiz introuvable.');
        if (quiz.module.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        const existing = await this.prisma.tentativeQuiz.findUnique({
            where: { quizId_apprenantId: { quizId, apprenantId: user.id } },
        });
        if (existing)
            throw new common_1.BadRequestException('Vous avez déjà passé ce quiz.');
        let correct = 0;
        const total = quiz.questions.length;
        for (const q of quiz.questions) {
            const rep = reponses.find(r => r.questionId === q.id);
            const opts = q.options;
            if (rep && opts[rep.selectedIndex]?.correct)
                correct++;
        }
        const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;
        return this.prisma.tentativeQuiz.create({
            data: {
                quizId,
                apprenantId: user.id,
                score,
                reponses: reponses,
            },
        });
    }
    async getMesTentatives(userId) {
        return this.prisma.tentativeQuiz.findMany({
            where: { apprenantId: userId },
            include: { quiz: { include: { module: { include: { formation: { select: { titre: true } } } } } } },
            orderBy: { datePassage: 'desc' },
        });
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], QuizService);
//# sourceMappingURL=quiz.service.js.map