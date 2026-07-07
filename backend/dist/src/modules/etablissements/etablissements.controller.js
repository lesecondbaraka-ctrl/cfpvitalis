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
exports.EtablissementsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const etablissement_guard_1 = require("../../common/guards/etablissement.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const etablissements_service_1 = require("./etablissements.service");
let EtablissementsController = class EtablissementsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    findAllPublic() {
        return this.service.findAllPublic();
    }
    findOne(id, req) {
        if (req.user.role !== role_enum_1.Role.ADMIN_CENTRE && req.user.etablissementId !== id) {
            throw new common_1.ForbiddenException('BR-02 : Accès interdit.');
        }
        return this.service.findOne(id);
    }
    create(data) {
        return this.service.create(data);
    }
    update(id, data) {
        return this.service.update(id, data);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.EtablissementsController = EtablissementsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EtablissementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('list/public'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EtablissementsController.prototype, "findAllPublic", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, etablissement_guard_1.EtablissementGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE, role_enum_1.Role.ADMIN_ETABLISSEMENT, role_enum_1.Role.PERSONNEL_ADMINISTRATIF),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EtablissementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EtablissementsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EtablissementsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN_CENTRE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EtablissementsController.prototype, "remove", null);
exports.EtablissementsController = EtablissementsController = __decorate([
    (0, common_1.Controller)('etablissements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [etablissements_service_1.EtablissementsService])
], EtablissementsController);
//# sourceMappingURL=etablissements.controller.js.map