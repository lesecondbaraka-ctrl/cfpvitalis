import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/utilisateurs.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class UtilisateursService {
    private prisma;
    private jwtService;
    private notificationsService;
    constructor(prisma: PrismaService, jwtService: JwtService, notificationsService: NotificationsService);
    register(dto: RegisterDto, ipAdresse?: string): Promise<{
        success: boolean;
        message: string;
        utilisateur: {
            id: string;
            nom: string;
            createdAt: Date | null;
            updatedAt: Date | null;
            email: string;
            etablissementId: string;
            prenom: string;
            role: import("@prisma/client").$Enums.utilisateur_role;
            actif: boolean | null;
        };
    }>;
    login(dto: LoginDto, ipAdresse?: string): Promise<{
        success: boolean;
        accessToken: string;
        refreshToken: string;
        utilisateur: {
            etablissement: {
                id: string;
                codeAntenne: string;
                nom: string;
                adresse: string | null;
                createdAt: Date | null;
                updatedAt: Date | null;
            };
            id: string;
            nom: string;
            createdAt: Date | null;
            updatedAt: Date | null;
            email: string;
            etablissementId: string;
            prenom: string;
            role: import("@prisma/client").$Enums.utilisateur_role;
            actif: boolean | null;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        success: boolean;
        accessToken: string;
        refreshToken: string;
    }>;
    validateUser(userId: string): Promise<{
        etablissement: {
            id: string;
            codeAntenne: string;
            nom: string;
            adresse: string | null;
            createdAt: Date | null;
            updatedAt: Date | null;
        };
        id: string;
        nom: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        email: string;
        etablissementId: string;
        prenom: string;
        role: import("@prisma/client").$Enums.utilisateur_role;
        actif: boolean | null;
    }>;
    findAll(): Promise<{
        id: string;
        nom: string;
        createdAt: Date | null;
        etablissement: {
            nom: string;
        };
        email: string;
        etablissementId: string;
        prenom: string;
        role: import("@prisma/client").$Enums.utilisateur_role;
        actif: boolean | null;
    }[]>;
    findByEtablissement(etablissementId: string): Promise<{
        id: string;
        nom: string;
        createdAt: Date | null;
        etablissement: {
            nom: string;
        };
        email: string;
        prenom: string;
        role: import("@prisma/client").$Enums.utilisateur_role;
        actif: boolean | null;
    }[]>;
    setActif(userId: string, actif: boolean, auteurId: string, ipAdresse: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
