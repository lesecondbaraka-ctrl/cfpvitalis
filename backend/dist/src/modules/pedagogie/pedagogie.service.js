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
exports.PedagogieService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../common/enums/role.enum");
let PedagogieService = class PedagogieService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFormations(user) {
        const where = user.role === role_enum_1.Role.ADMIN_CENTRE
            ? {}
            : { etablissementId: user.etablissementId };
        return this.prisma.formation.findMany({
            where,
            include: { modules: { include: { _count: { select: { cours: true } } } }, etablissement: { select: { nom: true } } },
            orderBy: { titre: 'asc' },
        });
    }
    async getFormation(id, user) {
        const formation = await this.prisma.formation.findUnique({
            where: { id },
            include: {
                modules: { include: { cours: true } },
                etablissement: { select: { nom: true } },
            },
        });
        if (!formation)
            throw new common_1.NotFoundException('Formation introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Vous ne pouvez pas accéder aux formations d\'un autre établissement.');
        }
        return formation;
    }
    async createFormation(data, user) {
        return this.prisma.formation.create({
            data: {
                titre: data.titre,
                description: data.description,
                etablissementId: user.etablissementId,
            },
        });
    }
    async updateFormation(id, data, user) {
        const formation = await this.getFormation(id, user);
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Modification interdite pour un établissement tiers.');
        }
        return this.prisma.formation.update({ where: { id }, data });
    }
    async createModule(formationId, data, user) {
        await this.getFormation(formationId, user);
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
    async createCours(moduleId, data, user) {
        const mod = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: { formation: true },
        });
        if (!mod)
            throw new common_1.NotFoundException('Module introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Ajout de cours interdit pour un établissement tiers.');
        }
        return this.prisma.cours.create({ data: { ...data, moduleId } });
    }
    async getCours(id) {
        const cours = await this.prisma.cours.findUnique({
            where: { id },
            include: { module: { include: { formation: true } } },
        });
        if (!cours)
            throw new common_1.NotFoundException('Cours introuvable.');
        return cours;
    }
    async markComplete(coursId, userId) {
        return this.prisma.userProgress.upsert({
            where: { utilisateurId_coursId: { utilisateurId: userId, coursId } },
            update: { complete: true },
            create: { utilisateurId: userId, coursId, complete: true },
        });
    }
    async getProgressByFormation(formationId, userId) {
        const formation = await this.prisma.formation.findUnique({
            where: { id: formationId },
            include: { modules: { include: { cours: true } } },
        });
        if (!formation)
            throw new common_1.NotFoundException('Formation introuvable.');
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
    async createEvaluation(moduleId, data, user) {
        const mod = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: { formation: true },
        });
        if (!mod)
            throw new common_1.NotFoundException('Module introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Création d\'évaluation interdite.');
        }
        return this.prisma.evaluation.create({
            data: { titre: data.titre, moduleId, noteMaximale: data.noteMaximale ?? 20 },
        });
    }
    async getEvaluationsByModule(moduleId, user) {
        const mod = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: { formation: true, evaluations: { include: { notes: true } } },
        });
        if (!mod)
            throw new common_1.NotFoundException('Module introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        return mod.evaluations;
    }
    async getApprenants(user) {
        const where = user.role === role_enum_1.Role.ADMIN_CENTRE
            ? { role: role_enum_1.Role.APPRENANT, actif: true }
            : { etablissementId: user.etablissementId, role: role_enum_1.Role.APPRENANT, actif: true };
        return this.prisma.utilisateur.findMany({
            where,
            select: { id: true, nom: true, prenom: true, email: true, etablissementId: true },
            orderBy: { nom: 'asc' },
        });
    }
    async getCoursWithProgress(coursId, userId) {
        const cours = await this.getCours(coursId);
        const progress = await this.prisma.userProgress.findUnique({
            where: { utilisateurId_coursId: { utilisateurId: userId, coursId } },
        });
        return { ...cours, complete: progress?.complete ?? false };
    }
    async uploadCoursDocument(coursId, fileUrl, user) {
        const cours = await this.getCours(coursId);
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && cours.module.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Upload interdit.');
        }
        return this.prisma.cours.update({ where: { id: coursId }, data: { fileUrl } });
    }
    async deleteFormation(id, user) {
        await this.getFormation(id, user);
        return this.prisma.formation.delete({ where: { id } });
    }
    async submitNote(evaluationId, userId, valeur, auteurId, ipAdresse) {
        const oldNote = await this.prisma.note.findUnique({
            where: { evaluationId_utilisateurId: { evaluationId, utilisateurId: userId } },
        });
        const oldNoteVal = oldNote ? oldNote.valeur : null;
        const result = await this.prisma.note.upsert({
            where: { evaluationId_utilisateurId: { evaluationId, utilisateurId: userId } },
            update: { valeur },
            create: { utilisateurId: userId, evaluationId, valeur, formateurId: auteurId },
        });
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
    async getMoyennePonderee(formationId, userId) {
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
};
exports.PedagogieService = PedagogieService;
exports.PedagogieService = PedagogieService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PedagogieService);
//# sourceMappingURL=pedagogie.service.js.map