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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const etablissement_guard_1 = require("../../common/guards/etablissement.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const certification_service_1 = require("./certification.service");
let CertificationController = class CertificationController {
    service;
    constructor(service) {
        this.service = service;
    }
    emettreCertificat(formationId, utilisateurId, req) {
        const baseUrl = req.headers.origin || 'http://localhost:4200';
        return this.service.emettreCertificat(formationId, utilisateurId, baseUrl);
    }
    mesCertificats(req) {
        return this.service.getCertificatsUtilisateur(req.user.id);
    }
    verifyCertificat(numeroSerie) {
        return this.service.verifyCertificat(numeroSerie);
    }
    async downloadPdf(numeroSerie, req) {
        return this.service.getPdfUrl(numeroSerie, req.user);
    }
};
exports.CertificationController = CertificationController;
__decorate([
    (0, common_1.Post)('emettre/:formationId/:utilisateurId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('formationId')),
    __param(1, (0, common_1.Param)('utilisateurId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "emettreCertificat", null);
__decorate([
    (0, common_1.Get)('mes-certificats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "mesCertificats", null);
__decorate([
    (0, common_1.Get)('verifier/:numeroSerie'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('numeroSerie')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificationController.prototype, "verifyCertificat", null);
__decorate([
    (0, common_1.Get)('download/:numeroSerie'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.APPRENANT, role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('numeroSerie')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CertificationController.prototype, "downloadPdf", null);
exports.CertificationController = CertificationController = __decorate([
    (0, common_1.Controller)('certification'),
    __metadata("design:paramtypes", [certification_service_1.CertificationService])
], CertificationController);
//# sourceMappingURL=certification.controller.js.map