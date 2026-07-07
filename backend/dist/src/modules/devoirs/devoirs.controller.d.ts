import { DevoirsService } from './devoirs.service';
export declare class DevoirsController {
    private service;
    constructor(service: DevoirsService);
    create(moduleId: string, body: any, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        consignes: string | null;
        dateLimite: Date | null;
    }>;
    findByModule(moduleId: string, req: any): Promise<({
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
    mesSoumissions(req: any): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    submit(id: string, file: Express.Multer.File, req: any): Promise<{
        id: string;
        fileUrl: string;
        note: import("@prisma/client-runtime-utils").Decimal | null;
        apprenantId: string;
        devoirId: string;
        dateDepot: Date;
        commentaire: string | null;
    }>;
    noter(id: string, apprenantId: string, body: {
        note: number;
        commentaire?: string;
    }, req: any): Promise<{
        id: string;
        fileUrl: string;
        note: import("@prisma/client-runtime-utils").Decimal | null;
        apprenantId: string;
        devoirId: string;
        dateDepot: Date;
        commentaire: string | null;
    }>;
}
