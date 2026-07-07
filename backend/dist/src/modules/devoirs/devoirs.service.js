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
exports.DevoirsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_service_1 = require("../../common/services/storage.service");
const role_enum_1 = require("../../common/enums/role.enum");
let DevoirsService = class DevoirsService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
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
        return this.prisma.devoir.create({
            data: {
                moduleId,
                titre: data.titre,
                consignes: data.consignes,
                dateLimite: data.dateLimite ? new Date(data.dateLimite) : undefined,
            },
        });
    }
    async findByModule(moduleId, user) {
        await this.assertModuleAccess(moduleId, user);
        return this.prisma.devoir.findMany({
            where: { moduleId },
            include: { _count: { select: { soumissions: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, user) {
        const devoir = await this.prisma.devoir.findUnique({
            where: { id },
            include: {
                module: { include: { formation: true } },
                soumissions: {
                    include: { apprenant: { select: { id: true, nom: true, prenom: true, email: true } } },
                },
            },
        });
        if (!devoir)
            throw new common_1.NotFoundException('Devoir introuvable.');
        if (user.role !== role_enum_1.Role.ADMIN_CENTRE && devoir.module.formation.etablissementId !== user.etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        return devoir;
    }
    async submit(devoirId, file, user) {
        if (user.role !== role_enum_1.Role.APPRENANT)
            throw new common_1.ForbiddenException('Réservé aux apprenants.');
        const devoir = await this.findOne(devoirId, user);
        if (devoir.dateLimite && new Date() > devoir.dateLimite) {
            throw new common_1.BadRequestException('La date limite de dépôt est dépassée.');
        }
        const fileUrl = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype, 'devoirs');
        return this.prisma.soumissionDevoir.upsert({
            where: { devoirId_apprenantId: { devoirId, apprenantId: user.id } },
            update: { fileUrl, dateDepot: new Date() },
            create: { devoirId, apprenantId: user.id, fileUrl },
        });
    }
    async noter(devoirId, apprenantId, note, commentaire, user) {
        await this.findOne(devoirId, user);
        return this.prisma.soumissionDevoir.update({
            where: { devoirId_apprenantId: { devoirId, apprenantId } },
            data: { note, commentaire },
        });
    }
    async mesSoumissions(userId) {
        return this.prisma.soumissionDevoir.findMany({
            where: { apprenantId: userId },
            include: { devoir: { include: { module: { include: { formation: { select: { titre: true } } } } } } },
            orderBy: { dateDepot: 'desc' },
        });
    }
};
exports.DevoirsService = DevoirsService;
exports.DevoirsService = DevoirsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, storage_service_1.StorageService])
], DevoirsService);
//# sourceMappingURL=devoirs.service.js.map