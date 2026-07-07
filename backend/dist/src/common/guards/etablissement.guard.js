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
exports.EtablissementGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EtablissementGuard = class EtablissementGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.etablissementId) {
            throw new common_1.ForbiddenException('BR-01 : Tout utilisateur doit être rattaché à un établissement physique actif.');
        }
        const etablissement = await this.prisma.etablissement.findUnique({
            where: { id: user.etablissementId },
        });
        if (!etablissement) {
            throw new common_1.ForbiddenException('BR-01 : L\'établissement de rattachement est introuvable.');
        }
        return true;
    }
};
exports.EtablissementGuard = EtablissementGuard;
exports.EtablissementGuard = EtablissementGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EtablissementGuard);
//# sourceMappingURL=etablissement.guard.js.map