import { PedagogieService } from './pedagogie.service';
import { StorageService } from '../../common/services/storage.service';
export declare class PedagogieController {
    private service;
    private storage;
    constructor(service: PedagogieService, storage: StorageService);
    getFormations(req: any): Promise<({
        etablissement: {
            nom: string;
        };
        modules: ({
            _count: {
                cours: number;
            };
        } & {
            id: string;
            createdAt: Date | null;
            titre: string;
            formationId: string;
            ordre: number;
            coefficient: import("@prisma/client-runtime-utils").Decimal | null;
        })[];
    } & {
        id: string;
        createdAt: Date | null;
        etablissementId: string;
        titre: string;
        description: string | null;
    })[]>;
    getFormation(id: string, req: any): Promise<{
        etablissement: {
            nom: string;
        };
        modules: ({
            cours: {
                id: string;
                createdAt: Date | null;
                titre: string;
                moduleId: string;
                contenu: string | null;
                fileUrl: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date | null;
            titre: string;
            formationId: string;
            ordre: number;
            coefficient: import("@prisma/client-runtime-utils").Decimal | null;
        })[];
    } & {
        id: string;
        createdAt: Date | null;
        etablissementId: string;
        titre: string;
        description: string | null;
    }>;
    createFormation(data: {
        titre: string;
        description: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        etablissementId: string;
        titre: string;
        description: string | null;
    }>;
    updateFormation(id: string, data: any, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        etablissementId: string;
        titre: string;
        description: string | null;
    }>;
    deleteFormation(id: string, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        etablissementId: string;
        titre: string;
        description: string | null;
    }>;
    createModule(formationId: string, data: {
        titre: string;
        coefficient?: number;
        ordre?: number;
    }, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        formationId: string;
        ordre: number;
        coefficient: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    createCours(moduleId: string, data: {
        titre: string;
        contenu?: string;
        fileUrl?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        contenu: string | null;
        fileUrl: string | null;
    }>;
    getCours(id: string, req: any): Promise<{
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
    } & {
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        contenu: string | null;
        fileUrl: string | null;
    }>;
    markComplete(coursId: string, req: any): Promise<{
        coursId: string;
        utilisateurId: string;
        complete: boolean | null;
        dateTerminaison: Date | null;
    }>;
    uploadCours(coursId: string, file: Express.Multer.File, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        contenu: string | null;
        fileUrl: string | null;
    }>;
    getProgress(formationId: string, req: any): Promise<{
        totalCours: number;
        totalObligatoire: number;
        completedObligatoire: number;
        completionRate: number;
    }>;
    getApprenants(req: any): Promise<{
        id: string;
        nom: string;
        email: string;
        etablissementId: string;
        prenom: string;
    }[]>;
    createEvaluation(moduleId: string, data: {
        titre: string;
        noteMaximale?: number;
    }, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        noteMaximale: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    getEvaluations(moduleId: string, req: any): Promise<({
        notes: {
            id: string;
            formateurId: string;
            utilisateurId: string;
            evaluationId: string;
            valeur: import("@prisma/client-runtime-utils").Decimal;
            dateNotation: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        noteMaximale: import("@prisma/client-runtime-utils").Decimal | null;
    })[]>;
    submitNote(evaluationId: string, data: {
        utilisateurId: string;
        valeur: number;
    }, req: any): Promise<{
        id: string;
        formateurId: string;
        utilisateurId: string;
        evaluationId: string;
        valeur: import("@prisma/client-runtime-utils").Decimal;
        dateNotation: Date | null;
    }>;
}
