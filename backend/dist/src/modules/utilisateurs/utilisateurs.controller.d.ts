import { UtilisateursService } from './utilisateurs.service';
import { RegisterDto, LoginDto } from './dto/utilisateurs.dto';
export declare class UtilisateursController {
    private utilisateursService;
    constructor(utilisateursService: UtilisateursService);
    register(dto: RegisterDto, req: any): Promise<{
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
    login(dto: LoginDto, req: any): Promise<{
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
    refresh(body: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
        accessToken: string;
        refreshToken: string;
    }>;
    getMe(req: any): Promise<{
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
    findByEtablissement(etablissementId: string, req: any): Promise<{
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
    setActif(id: string, body: {
        actif: boolean;
    }, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
