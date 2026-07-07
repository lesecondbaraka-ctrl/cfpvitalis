import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/services/storage.service';
export declare class DevoirsService {
    private prisma;
    private storage;
    constructor(prisma: PrismaService, storage: StorageService);
    private assertModuleAccess;
    create(moduleId: string, data: {
        titre: string;
        consignes?: string;
        dateLimite?: string;
    }, user: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        consignes: string | null;
        dateLimite: Date | null;
    }>;
    findByModule(moduleId: string, user: any): Promise<({
        _count: {
            soumissions: number;
        };
    } & {
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        consignes: string | null;
        dateLimite: Date | null;
    })[]>;
    findOne(id: string, user: any): Promise<{
        module: {
            formation: {
                id: string;
                createdAt: Date | null;
                etablissementId: string;
                titre: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date | null;
            titre: string;
            formationId: string;
            ordre: number;
            coefficient: import("@prisma/client-runtime-utils").Decimal | null;
        };
        soumissions: ({
            apprenant: {
                id: string;
                nom: string;
                email: string;
                prenom: string;
            };
        } & {
            id: string;
            fileUrl: string;
            note: import("@prisma/client-runtime-utils").Decimal | null;
            apprenantId: string;
            devoirId: string;
            dateDepot: Date;
            commentaire: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        consignes: string | null;
        dateLimite: Date | null;
    }>;
    submit(devoirId: string, file: Express.Multer.File, user: any): Promise<{
        id: string;
        fileUrl: string;
        note: import("@prisma/client-runtime-utils").Decimal | null;
        apprenantId: string;
        devoirId: string;
        dateDepot: Date;
        commentaire: string | null;
    }>;
    noter(devoirId: string, apprenantId: string, note: number, commentaire: string, user: any): Promise<{
        id: string;
        fileUrl: string;
        note: import("@prisma/client-runtime-utils").Decimal | null;
        apprenantId: string;
        devoirId: string;
        dateDepot: Date;
        commentaire: string | null;
    }>;
    mesSoumissions(userId: string): Promise<({
        devoir: {
            module: {
                formation: {
                    titre: string;
                };
            } & {
                id: string;
                createdAt: Date | null;
                titre: string;
                formationId: string;
                ordre: number;
                coefficient: import("@prisma/client-runtime-utils").Decimal | null;
            };
        } & {
            id: string;
            createdAt: Date | null;
            titre: string;
            moduleId: string;
            consignes: string | null;
            dateLimite: Date | null;
        };
    } & {
        id: string;
        fileUrl: string;
        note: import("@prisma/client-runtime-utils").Decimal | null;
        apprenantId: string;
        devoirId: string;
        dateDepot: Date;
        commentaire: string | null;
    })[]>;
}
