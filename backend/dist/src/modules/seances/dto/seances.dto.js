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
exports.BulkEmargementDto = exports.EmargementDto = exports.UpdateSeanceDto = exports.CreateSeanceDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateSeanceDto {
    moduleId;
    coursId;
    titreActivite;
    typeSession;
    dateHeureDebut;
    dateHeureFin;
    salleOuLien;
}
exports.CreateSeanceDto = CreateSeanceDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "moduleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "coursId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "titreActivite", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.type_seance),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "typeSession", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "dateHeureDebut", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "dateHeureFin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSeanceDto.prototype, "salleOuLien", void 0);
class UpdateSeanceDto {
    titreActivite;
    typeSession;
    dateHeureDebut;
    dateHeureFin;
    salleOuLien;
}
exports.UpdateSeanceDto = UpdateSeanceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "titreActivite", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.type_seance),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "typeSession", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "dateHeureDebut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "dateHeureFin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSeanceDto.prototype, "salleOuLien", void 0);
class EmargementDto {
    apprenantId;
    statut;
    remarqueJustification;
}
exports.EmargementDto = EmargementDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], EmargementDto.prototype, "apprenantId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.statut_presence),
    __metadata("design:type", String)
], EmargementDto.prototype, "statut", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EmargementDto.prototype, "remarqueJustification", void 0);
class BulkEmargementDto {
    presences;
}
exports.BulkEmargementDto = BulkEmargementDto;
//# sourceMappingURL=seances.dto.js.map