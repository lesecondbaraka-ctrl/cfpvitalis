"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevoirsModule = void 0;
const common_1 = require("@nestjs/common");
const devoirs_controller_1 = require("./devoirs.controller");
const devoirs_service_1 = require("./devoirs.service");
let DevoirsModule = class DevoirsModule {
};
exports.DevoirsModule = DevoirsModule;
exports.DevoirsModule = DevoirsModule = __decorate([
    (0, common_1.Module)({
        controllers: [devoirs_controller_1.DevoirsController],
        providers: [devoirs_service_1.DevoirsService],
    })
], DevoirsModule);
//# sourceMappingURL=devoirs.module.js.map