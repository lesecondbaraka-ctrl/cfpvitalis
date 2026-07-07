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
exports.EtablissementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EtablissementsService = class EtablissementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllPublic() {
        return this.prisma.etablissement.findMany({
            select: { id: true, nom: true, codeAntenne: true },
            orderBy: { nom: 'asc' },
        });
    }
    async findAll() {
        return this.prisma.etablissement.findMany({
            include: { _count: { select: { utilisateurs: true, formations: true } } },
            orderBy: { nom: 'asc' },
        });
    }
    async findOne(id) {
        const etab = await this.prisma.etablissement.findUnique({
            where: { id },
            include: {
                utilisateurs: { select: { id: true, nom: true, prenom: true, email: true, role: true } },
                formations: { select: { id: true, titre: true } },
            },
        });
        if (!etab)
            throw new common_1.NotFoundException('Établissement introuvable.');
        return etab;
    }
    async create(data) {
        const codeAntenne = data.codeAntenne || 'ANT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        return this.prisma.etablissement.create({
            data: {
                nom: data.nom,
                adresse: data.adresse,
                codeAntenne,
            },
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.etablissement.update({ where: { id }, data });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.etablissement.delete({ where: { id } });
    }
};
exports.EtablissementsService = EtablissementsService;
exports.EtablissementsService = EtablissementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EtablissementsService);
//# sourceMappingURL=etablissements.service.js.map