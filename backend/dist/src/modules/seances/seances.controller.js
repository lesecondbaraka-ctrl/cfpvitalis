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
exports.SeancesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const etablissement_guard_1 = require("../../common/guards/etablissement.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const seances_service_1 = require("./seances.service");
const seances_dto_1 = require("./dto/seances.dto");
let SeancesController = class SeancesController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, req) {
        return this.service.create(dto, req.user);
    }
    findAll(req) {
        return this.service.findByEtablissement(req.user);
    }
    findByModule(moduleId, req) {
        return this.service.findByModule(moduleId, req.user);
    }
    getAssiduite(apprenantId, req) {
        return this.service.getAssiduite(apprenantId, req.user);
    }
    findOne(id, req) {
        return this.service.findOne(id, req.user);
    }
    update(id, dto, req) {
        return this.service.update(id, dto, req.user);
    }
    remove(id, req) {
        return this.service.remove(id, req.user);
    }
    emargement(id, dto, req) {
        const ip = req.ip || '0.0.0.0';
        return this.service.emargement(id, dto.presences, req.user, ip);
    }
    getApprenants(id, req) {
        return this.service.getApprenantsSeance(id, req.user);
    }
};
exports.SeancesController = SeancesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [seances_dto_1.CreateSeanceDto, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF, role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('module/:moduleId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Param)('moduleId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "findByModule", null);
__decorate([
    (0, common_1.Get)('apprenant/:apprenantId/assiduite'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF, role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Param)('apprenantId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "getAssiduite", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF, role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seances_dto_1.UpdateSeanceDto, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/emargement'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, seances_dto_1.BulkEmargementDto, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "emargement", null);
__decorate([
    (0, common_1.Get)(':id/apprenants'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SeancesController.prototype, "getApprenants", null);
exports.SeancesController = SeancesController = __decorate([
    (0, common_1.Controller)('seances'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [seances_service_1.SeancesService])
], SeancesController);
//# sourceMappingURL=seances.controller.js.map