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
exports.UtilisateursController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const etablissement_guard_1 = require("../../common/guards/etablissement.guard");
const utilisateurs_service_1 = require("./utilisateurs.service");
const utilisateurs_dto_1 = require("./dto/utilisateurs.dto");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let UtilisateursController = class UtilisateursController {
    utilisateursService;
    constructor(utilisateursService) {
        this.utilisateursService = utilisateursService;
    }
    async register(dto, req) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
        return this.utilisateursService.register(dto, ip);
    }
    async login(dto, req) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
        return this.utilisateursService.login(dto, ip);
    }
    refresh(body) {
        return this.utilisateursService.refreshToken(body.refreshToken);
    }
    async getMe(req) {
        return this.utilisateursService.validateUser(req.user.id);
    }
    findAll() {
        return this.utilisateursService.findAll();
    }
    findByEtablissement(etablissementId, req) {
        if (req.user.role !== role_enum_1.Role.ADMIN_CENTRE && req.user.etablissementId !== etablissementId) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        return this.utilisateursService.findByEtablissement(etablissementId);
    }
    async setActif(id, body, req) {
        const ip = req.ip || '0.0.0.0';
        return this.utilisateursService.setActif(id, body.actif, req.user.id, ip);
    }
};
exports.UtilisateursController = UtilisateursController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [utilisateurs_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], UtilisateursController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [utilisateurs_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], UtilisateursController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UtilisateursController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UtilisateursController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UtilisateursController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('etablissement/:etablissementId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Param)('etablissementId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UtilisateursController.prototype, "findByEtablissement", null);
__decorate([
    (0, common_1.Put)(':id/activer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UtilisateursController.prototype, "setActif", null);
exports.UtilisateursController = UtilisateursController = __decorate([
    (0, common_1.Controller)('utilisateurs'),
    __metadata("design:paramtypes", [utilisateurs_service_1.UtilisateursService])
], UtilisateursController);
//# sourceMappingURL=utilisateurs.controller.js.map