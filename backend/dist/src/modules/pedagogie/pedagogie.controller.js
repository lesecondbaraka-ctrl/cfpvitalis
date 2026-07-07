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
exports.PedagogieController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const etablissement_guard_1 = require("../../common/guards/etablissement.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const pedagogie_service_1 = require("./pedagogie.service");
const storage_service_1 = require("../../common/services/storage.service");
let PedagogieController = class PedagogieController {
    service;
    storage;
    constructor(service, storage) {
        this.service = service;
        this.storage = storage;
    }
    getFormations(req) {
        return this.service.getFormations(req.user);
    }
    getFormation(id, req) {
        return this.service.getFormation(id, req.user);
    }
    createFormation(data, req) {
        return this.service.createFormation(data, req.user);
    }
    updateFormation(id, data, req) {
        return this.service.updateFormation(id, data, req.user);
    }
    deleteFormation(id, req) {
        return this.service.deleteFormation(id, req.user);
    }
    createModule(formationId, data, req) {
        return this.service.createModule(formationId, data, req.user);
    }
    createCours(moduleId, data, req) {
        return this.service.createCours(moduleId, data, req.user);
    }
    getCours(id, req) {
        if (req.user.role === role_enum_1.Role.APPRENANT) {
            return this.service.getCoursWithProgress(id, req.user.id);
        }
        return this.service.getCours(id);
    }
    markComplete(coursId, req) {
        return this.service.markComplete(coursId, req.user.id);
    }
    async uploadCours(coursId, file, req) {
        const url = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype, 'cours');
        return this.service.uploadCoursDocument(coursId, url, req.user);
    }
    getProgress(formationId, req) {
        const userId = req.query.apprenantId || req.user.id;
        return this.service.getProgressByFormation(formationId, userId);
    }
    getApprenants(req) {
        return this.service.getApprenants(req.user);
    }
    createEvaluation(moduleId, data, req) {
        return this.service.createEvaluation(moduleId, data, req.user);
    }
    getEvaluations(moduleId, req) {
        return this.service.getEvaluationsByModule(moduleId, req.user);
    }
    submitNote(evaluationId, data, req) {
        const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
        return this.service.submitNote(evaluationId, data.utilisateurId, data.valeur, req.user.id, ip);
    }
};
exports.PedagogieController = PedagogieController;
__decorate([
    (0, common_1.Get)('formations'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.APPRENANT, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "getFormations", null);
__decorate([
    (0, common_1.Get)('formations/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.APPRENANT, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "getFormation", null);
__decorate([
    (0, common_1.Post)('formations'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "createFormation", null);
__decorate([
    (0, common_1.Put)('formations/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "updateFormation", null);
__decorate([
    (0, common_1.Delete)('formations/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "deleteFormation", null);
__decorate([
    (0, common_1.Post)('formations/:formationId/modules'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('formationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "createModule", null);
__decorate([
    (0, common_1.Post)('modules/:moduleId/cours'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('moduleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "createCours", null);
__decorate([
    (0, common_1.Get)('cours/:id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "getCours", null);
__decorate([
    (0, common_1.Post)('cours/:coursId/complete'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Param)('coursId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "markComplete", null);
__decorate([
    (0, common_1.Post)('cours/:coursId/upload'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('coursId')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PedagogieController.prototype, "uploadCours", null);
__decorate([
    (0, common_1.Get)('formations/:formationId/progress'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.APPRENANT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT),
    __param(0, (0, common_1.Param)('formationId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Get)('apprenants'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "getApprenants", null);
__decorate([
    (0, common_1.Post)('modules/:moduleId/evaluations'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.FORMATEUR, role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT),
    __param(0, (0, common_1.Param)('moduleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "createEvaluation", null);
__decorate([
    (0, common_1.Get)('modules/:moduleId/evaluations'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.FORMATEUR, role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT),
    __param(0, (0, common_1.Param)('moduleId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "getEvaluations", null);
__decorate([
    (0, common_1.Post)('evaluations/:evaluationId/notes'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.FORMATEUR, role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT),
    __param(0, (0, common_1.Param)('evaluationId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PedagogieController.prototype, "submitNote", null);
exports.PedagogieController = PedagogieController = __decorate([
    (0, common_1.Controller)('pedagogie'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [pedagogie_service_1.PedagogieService,
        storage_service_1.StorageService])
], PedagogieController);
//# sourceMappingURL=pedagogie.controller.js.map