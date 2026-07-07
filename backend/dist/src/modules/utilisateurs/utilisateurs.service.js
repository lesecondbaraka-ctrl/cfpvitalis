"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilisateursService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let UtilisateursService = class UtilisateursService {
    prisma;
    jwtService;
    notificationsService;
    constructor(prisma, jwtService, notificationsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.notificationsService = notificationsService;
    }
    async register(dto, ipAdresse = '0.0.0.0') {
        const etablissement = await this.prisma.etablissement.findUnique({
            where: { id: dto.etablissementId },
        });
        if (!etablissement) {
            throw new common_1.ForbiddenException('BR-01 : L\'établissement de rattachement est introuvable.');
        }
        const existingUser = await this.prisma.utilisateur.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Un utilisateur avec cet email existe déjà.');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.utilisateur.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                nom: dto.nom,
                prenom: dto.prenom,
                role: dto.role,
                etablissementId: dto.etablissementId,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                auteurId: user.id,
                action: 'INSCRIPTION',
                details: { message: `Inscription de ${user.prenom} ${user.nom}`, role: user.role },
                ipAdresse,
            },
        });
        try {
            this.notificationsService.emit({ type: 'auth', event: 'register', user: { id: user.id, nom: user.nom, prenom: user.prenom }, message: 'Inscription réussie.' });
        }
        catch {
        }
        const { password, ...result } = user;
        return {
            success: true,
            message: 'Inscription réussie.',
            utilisateur: result,
        };
    }
    async login(dto, ipAdresse = '0.0.0.0') {
        const user = await this.prisma.utilisateur.findUnique({
            where: { email: dto.email },
            include: { etablissement: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Identifiants incorrects.');
        }
        if (!user.actif) {
            throw new common_1.ForbiddenException('Votre compte utilisateur a été désactivé par un administrateur.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Identifiants incorrects.');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            etablissementId: user.etablissementId,
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        await this.prisma.auditLog.create({
            data: {
                auteurId: user.id,
                action: 'CONNEXION',
                details: { message: `Connexion de ${user.prenom} ${user.nom}` },
                ipAdresse,
            },
        });
        try {
            this.notificationsService.emit({ type: 'auth', event: 'login', user: { id: user.id, nom: user.nom, prenom: user.prenom }, message: 'Connexion réussie.' });
        }
        catch {
        }
        const { password, ...result } = user;
        return {
            success: true,
            accessToken,
            refreshToken,
            utilisateur: result,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.validateUser(payload.sub);
            const newPayload = {
                sub: user.id,
                email: user.email,
                role: user.role,
                etablissementId: user.etablissementId,
            };
            return {
                success: true,
                accessToken: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
                refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
            };
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token invalide ou expiré.');
        }
    }
    async validateUser(userId) {
        const user = await this.prisma.utilisateur.findUnique({
            where: { id: userId },
            include: { etablissement: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Utilisateur introuvable.');
        }
        if (!user.actif) {
            throw new common_1.UnauthorizedException('Compte utilisateur désactivé.');
        }
        const { password, ...result } = user;
        return result;
    }
    async findAll() {
        const users = await this.prisma.utilisateur.findMany({
            select: {
                id: true, email: true, nom: true, prenom: true, role: true,
                etablissementId: true, actif: true, createdAt: true,
                etablissement: { select: { nom: true } },
            },
            orderBy: [{ etablissementId: 'asc' }, { nom: 'asc' }],
        });
        return users;
    }
    async findByEtablissement(etablissementId) {
        return this.prisma.utilisateur.findMany({
            where: { etablissementId },
            select: {
                id: true, email: true, nom: true, prenom: true, role: true, actif: true, createdAt: true,
                etablissement: { select: { nom: true } },
            },
            orderBy: { nom: 'asc' },
        });
    }
    async setActif(userId, actif, auteurId, ipAdresse) {
        const targetUser = await this.prisma.utilisateur.findUnique({
            where: { id: userId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException('Utilisateur introuvable.');
        }
        await this.prisma.utilisateur.update({
            where: { id: userId },
            data: { actif },
        });
        await this.prisma.auditLog.create({
            data: {
                auteurId,
                action: actif ? 'ACTIVATION_UTILISATEUR' : 'DESACTIVATION_UTILISATEUR',
                details: { userId, action: actif ? 'activation' : 'désactivation' },
                ipAdresse,
            },
        });
        return { success: true, message: `Utilisateur ${actif ? 'activé' : 'désactivé'}.` };
    }
};
exports.UtilisateursService = UtilisateursService;
exports.UtilisateursService = UtilisateursService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        notifications_service_1.NotificationsService])
], UtilisateursService);
//# sourceMappingURL=utilisateurs.service.js.map