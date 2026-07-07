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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../common/enums/role.enum");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobalKpi() {
        const [etablissements, utilisateurs, formations, certificats, seances] = await Promise.all([
            this.prisma.etablissement.count(),
            this.prisma.utilisateur.groupBy({ by: ['role'], _count: true }),
            this.prisma.formation.count(),
            this.prisma.certificat.count(),
            this.prisma.seanceFormation.count(),
        ]);
        const apprenants = utilisateurs.find(u => u.role === 'APPRENANT')?._count ?? 0;
        const formateurs = utilisateurs.find(u => u.role === 'FORMATEUR')?._count ?? 0;
        return {
            etablissements,
            apprenants,
            formateurs,
            formations,
            certificatsEmis: certificats,
            seancesPlanifiees: seances,
        };
    }
    async getEtablissementKpi(etablissementId, user) {
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && user.etablissementId !== etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        const [utilisateurs, formations, certificats, presences] = await Promise.all([
            this.prisma.utilisateur.groupBy({
                by: ['role'],
                where: { etablissementId },
                _count: true,
            }),
            this.prisma.formation.count({ where: { etablissementId } }),
            this.prisma.certificat.count({
                where: { formation: { etablissementId } },
            }),
            this.prisma.presenceSeance.findMany({
                where: { utilisateur: { etablissementId } },
            }),
        ]);
        const apprenants = utilisateurs.find(u => u.role === 'APPRENANT')?._count ?? 0;
        const totalPresences = presences.length;
        const present = presences.filter(p => p.statut === 'PRESENT' || p.statut === 'RETARD').length;
        const tauxAssiduite = totalPresences > 0 ? Math.round((present / totalPresences) * 100) : 0;
        const progressRecords = await this.prisma.userProgress.findMany({
            where: { utilisateur: { etablissementId } },
        });
        const totalProgress = progressRecords.length;
        const completed = progressRecords.filter(p => p.complete).length;
        const tauxCompletion = totalProgress > 0 ? Math.round((completed / totalProgress) * 100) : 0;
        const notes = await this.prisma.note.findMany({
            where: { utilisateur: { etablissementId } },
        });
        const moyenneGenerale = notes.length > 0
            ? Math.round(notes.reduce((s, n) => s + Number(n.valeur), 0) / notes.length * 100) / 100
            : 0;
        return {
            etablissementId,
            apprenants,
            formations,
            certificatsEmis: certificats,
            tauxAssiduite,
            tauxCompletion,
            moyenneGenerale,
        };
    }
    async getFormationStats(formationId, user) {
        const formation = await this.prisma.formation.findUnique({
            where: { id: formationId },
            include: {
                modules: {
                    include: {
                        cours: true,
                        evaluations: { include: { notes: true } },
                    },
                },
            },
        });
        if (!formation)
            return null;
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        const allCoursIds = formation.modules.flatMap(m => m.cours.map(c => c.id));
        const apprenants = await this.prisma.utilisateur.count({
            where: { etablissementId: formation.etablissementId, role: 'APPRENANT', actif: true },
        });
        const progress = await this.prisma.userProgress.findMany({
            where: { coursId: { in: allCoursIds }, complete: true },
        });
        const allNotes = formation.modules.flatMap(m => m.evaluations.flatMap(e => e.notes.map(n => Number(n.valeur))));
        const moyenne = allNotes.length > 0
            ? Math.round(allNotes.reduce((s, v) => s + v, 0) / allNotes.length * 100) / 100
            : 0;
        const certificats = await this.prisma.certificat.count({ where: { formationId } });
        return {
            formationId,
            titre: formation.titre,
            modules: formation.modules.length,
            cours: allCoursIds.length,
            apprenants,
            tauxCompletion: allCoursIds.length > 0 && apprenants > 0
                ? Math.round((progress.length / (allCoursIds.length * apprenants)) * 100)
                : 0,
            moyenneGenerale: moyenne,
            certificatsEmis: certificats,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map