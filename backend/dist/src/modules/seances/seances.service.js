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
exports.SeancesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../common/enums/role.enum");
let SeancesService = class SeancesService {
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
            throw new common_1.ForbiddenException('BR-02 : Accès interdit à ce module.');
        }
        return mod;
    }
    async create(dto, user) {
        await this.assertModuleAccess(dto.moduleId, user);
        if (new Date(dto.dateHeureFin) <= new Date(dto.dateHeureDebut)) {
            throw new common_1.BadRequestException('La date de fin doit être postérieure à la date de début.');
        }
        return this.prisma.seanceFormation.create({
            data: {
                moduleId: dto.moduleId,
                coursId: dto.coursId,
                formateurId: user.id,
                titreActivite: dto.titreActivite,
                typeSession: dto.typeSession,
                dateHeureDebut: new Date(dto.dateHeureDebut),
                dateHeureFin: new Date(dto.dateHeureFin),
                salleOuLien: dto.salleOuLien,
            },
            include: { module: true, formateur: { select: { nom: true, prenom: true } } },
        });
    }
    async findByModule(moduleId, user) {
        await this.assertModuleAccess(moduleId, user);
        return this.prisma.seanceFormation.findMany({
            where: { moduleId },
            include: {
                formateur: { select: { nom: true, prenom: true } },
                _count: { select: { presences: true } },
            },
            orderBy: { dateHeureDebut: 'asc' },
        });
    }
    async findByEtablissement(user) {
        const where = user.role === role_enum_1.Role.ADMIN_CENTRE
            ? {}
            : { module: { formation: { etablissementId: user.etablissementId } } };
        return this.prisma.seanceFormation.findMany({
            where,
            include: {
                module: { include: { formation: { select: { titre: true } } } },
                formateur: { select: { nom: true, prenom: true } },
                _count: { select: { presences: true } },
            },
            orderBy: { dateHeureDebut: 'desc' },
        });
    }
    async findOne(id, user) {
        const seance = await this.prisma.seanceFormation.findUnique({
            where: { id },
            include: {
                module: { include: { formation: true } },
                formateur: { select: { id: true, nom: true, prenom: true } },
                presences: {
                    include: { utilisateur: { select: { id: true, nom: true, prenom: true, email: true } } },
                },
            },
        });
        if (!seance)
            throw new common_1.NotFoundException('Séance introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE &&
            seance.module.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        return seance;
    }
    async update(id, dto, user) {
        const seance = await this.findOne(id, user);
        if (user.role === role_enum_1.Role.FORMATEUR && seance.formateurId !== user.id) {
            throw new common_1.ForbiddenException('Seul le formateur assigné peut modifier cette séance.');
        }
        return this.prisma.seanceFormation.update({
            where: { id },
            data: {
                ...dto,
                dateHeureDebut: dto.dateHeureDebut ? new Date(dto.dateHeureDebut) : undefined,
                dateHeureFin: dto.dateHeureFin ? new Date(dto.dateHeureFin) : undefined,
            },
        });
    }
    async remove(id, user) {
        await this.findOne(id, user);
        return this.prisma.seanceFormation.delete({ where: { id } });
    }
    async emargement(seanceId, presences, user, ip) {
        const seance = await this.findOne(seanceId, user);
        const canEmarger = [role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF]
            .includes(user.role);
        if (!canEmarger)
            throw new common_1.ForbiddenException('Droits d\'émargement insuffisants.');
        if (user.role === role_enum_1.Role.FORMATEUR && seance.formateurId !== user.id) {
            throw new common_1.ForbiddenException('Seul le formateur assigné peut effectuer l\'émargement.');
        }
        const results = [];
        for (const p of presences) {
            const result = await this.prisma.presenceSeance.upsert({
                where: { seanceId_utilisateurId: { seanceId, utilisateurId: p.apprenantId } },
                update: { statut: p.statut, remarqueJustification: p.remarqueJustification },
                create: {
                    seanceId,
                    utilisateurId: p.apprenantId,
                    statut: p.statut,
                    remarqueJustification: p.remarqueJustification,
                },
            });
            results.push(result);
        }
        await this.prisma.auditLog.create({
            data: {
                auteurId: user.id,
                action: 'EMARGEMENT',
                ipAdresse: ip,
                tableCible: 'presences_seances',
                details: { seanceId, count: presences.length },
            },
        });
        return { success: true, presences: results };
    }
    async getAssiduite(apprenantId, user) {
        if (user.role === role_enum_1.Role.APPRENANT && user.id !== apprenantId) {
            throw new common_1.ForbiddenException('Accès interdit.');
        }
        const presences = await this.prisma.presenceSeance.findMany({
            where: { utilisateurId: apprenantId },
        });
        const total = presences.length;
        const present = presences.filter(p => p.statut === 'PRESENT' || p.statut === 'RETARD').length;
        const taux = total > 0 ? Math.round((present / total) * 100) : 100;
        return { total, present, absent: total - present, tauxAssiduite: taux };
    }
    async getApprenantsSeance(seanceId, user) {
        const seance = await this.findOne(seanceId, user);
        return this.prisma.utilisateur.findMany({
            where: {
                etablissementId: seance.module.formation.etablissementId,
                role: role_enum_1.Role.APPRENANT,
                actif: true,
            },
            select: { id: true, nom: true, prenom: true, email: true },
            orderBy: { nom: 'asc' },
        });
    }
};
exports.SeancesService = SeancesService;
exports.SeancesService = SeancesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeancesService);
//# sourceMappingURL=seances.service.js.map