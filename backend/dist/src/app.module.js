"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const common_module_1 = require("./common/common.module");
const utilisateurs_module_1 = require("./modules/utilisateurs/utilisateurs.module");
const etablissements_module_1 = require("./modules/etablissements/etablissements.module");
const pedagogie_module_1 = require("./modules/pedagogie/pedagogie.module");
const certification_module_1 = require("./modules/certification/certification.module");
const seances_module_1 = require("./modules/seances/seances.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const quiz_module_1 = require("./modules/quiz/quiz.module");
const devoirs_module_1 = require("./modules/devoirs/devoirs.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const etablissement_guard_1 = require("./common/guards/etablissement.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            common_module_1.CommonModule,
            prisma_module_1.PrismaModule,
            utilisateurs_module_1.UtilisateursModule,
            etablissements_module_1.EtablissementsModule,
            pedagogie_module_1.PedagogieModule,
            certification_module_1.CertificationModule,
            seances_module_1.SeancesModule,
            analytics_module_1.AnalyticsModule,
            quiz_module_1.QuizModule,
            devoirs_module_1.DevoirsModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            etablissement_guard_1.EtablissementGuard,
            {
                provide: core_1.APP_PIPE,
                useValue: new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map