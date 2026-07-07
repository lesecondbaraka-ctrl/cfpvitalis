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
exports.QuizController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const etablissement_guard_1 = require("../../common/guards/etablissement.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const quiz_service_1 = require("./quiz.service");
let QuizController = class QuizController {
    service;
    constructor(service) {
        this.service = service;
    }
    mesTentatives(req) {
        return this.service.getMesTentatives(req.user.id);
    }
    create(moduleId, body, req) {
        return this.service.create(moduleId, body, req.user);
    }
    findByModule(moduleId, req) {
        return this.service.findByModule(moduleId, req.user);
    }
    findOne(id, req) {
        const forApprenant = req.user.role === role_enum_1.Role.APPRENANT;
        return this.service.findOne(id, req.user, forApprenant);
    }
    submit(id, body, req) {
        return this.service.submit(id, body.reponses, req.user);
    }
};
exports.QuizController = QuizController;
__decorate([
    (0, common_1.Get)('mes/tentatives'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "mesTentatives", null);
__decorate([
    (0, common_1.Post)('module/:moduleId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR),
    __param(0, (0, common_1.Param)('moduleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('module/:moduleId'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Param)('moduleId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "findByModule", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.FORMATEUR, role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.APPRENANT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], QuizController.prototype, "submit", null);
exports.QuizController = QuizController = __decorate([
    (0, common_1.Controller)('quiz'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [quiz_service_1.QuizService])
], QuizController);
//# sourceMappingURL=quiz.controller.js.map