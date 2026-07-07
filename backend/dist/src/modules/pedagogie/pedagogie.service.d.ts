import { PrismaService } from '../../prisma/prisma.service';
export declare class PedagogieService {
    private prisma;
    constructor(prisma: PrismaService);
    getFormations(user: any): Promise<({
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
    getFormation(id: string, user: any): Promise<{
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
    }, user: any): Promise<{
        id: string;
        createdAt: Date | null;
        etablissementId: string;
        titre: string;
        description: string | null;
    }>;
    updateFormation(id: string, data: {
        titre?: string;
        description?: string;
    }, user: any): Promise<{
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
    }, user: any): Promise<{
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
    }, user: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        contenu: string | null;
        fileUrl: string | null;
    }>;
    getCours(id: string): Promise<{
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
    markComplete(coursId: string, userId: string): Promise<{
        coursId: string;
        utilisateurId: string;
        complete: boolean | null;
        dateTerminaison: Date | null;
    }>;
    getProgressByFormation(formationId: string, userId: string): Promise<{
        totalCours: number;
        totalObligatoire: number;
        completedObligatoire: number;
        completionRate: number;
    }>;
    createEvaluation(moduleId: string, data: {
        titre: string;
        noteMaximale?: number;
    }, user: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        noteMaximale: import("@prisma/client-runtime-utils").Decimal | null;
    }>;
    getEvaluationsByModule(moduleId: string, user: any): Promise<({
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
    getApprenants(user: any): Promise<{
        id: string;
        nom: string;
        email: string;
        etablissementId: string;
        prenom: string;
    }[]>;
    getCoursWithProgress(coursId: string, userId: string): Promise<{
        complete: boolean;
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
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        contenu: string | null;
        fileUrl: string | null;
    }>;
    uploadCoursDocument(coursId: string, fileUrl: string, user: any): Promise<{
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        contenu: string | null;
        fileUrl: string | null;
    }>;
    deleteFormation(id: string, user: any): Promise<{
        id: string;
        createdAt: Date | null;
        etablissementId: string;
        titre: string;
        description: string | null;
    }>;
    submitNote(evaluationId: string, userId: string, valeur: number, auteurId: string, ipAdresse: string): Promise<{
        id: string;
        formateurId: string;
        utilisateurId: string;
        evaluationId: string;
        valeur: import("@prisma/client-runtime-utils").Decimal;
        dateNotation: Date | null;
    }>;
    getMoyennePonderee(formationId: string, userId: string): Promise<number>;
}
