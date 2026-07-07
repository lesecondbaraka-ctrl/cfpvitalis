import { PrismaService } from '../../prisma/prisma.service';
export declare class QuizService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertModuleAccess;
    create(moduleId: string, data: {
        titre: string;
        dureeMinutes?: number;
        questions: {
            enonce: string;
            options: {
                text: string;
                correct: boolean;
            }[];
        }[];
    }, user: any): Promise<{
        questions: {
            id: string;
            ordre: number;
            quizId: string;
            enonce: string;
            options: import("@prisma/client/runtime/client").JsonValue;
        }[];
    } & {
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        dureeMinutes: number | null;
    }>;
    findByModule(moduleId: string, user: any): Promise<({
        _count: {
            questions: number;
            tentatives: number;
        };
    } & {
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        dureeMinutes: number | null;
    })[]>;
    findOne(id: string, user: any, forApprenant?: boolean): Promise<({
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
        questions: {
            id: string;
            ordre: number;
            quizId: string;
            enonce: string;
            options: import("@prisma/client/runtime/client").JsonValue;
        }[];
    } & {
        id: string;
        createdAt: Date | null;
        titre: string;
        moduleId: string;
        dureeMinutes: number | null;
    }) | {
        questions: {
            id: string;
            enonce: string;
            ordre: number;
            options: {
                text: any;
            }[];
        }[];
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
        dureeMinutes: number | null;
    }>;
    submit(quizId: string, reponses: {
        questionId: string;
        selectedIndex: number;
    }[], user: any): Promise<{
        id: string;
        quizId: string;
        apprenantId: string;
        score: import("@prisma/client-runtime-utils").Decimal;
        reponses: import("@prisma/client/runtime/client").JsonValue | null;
        datePassage: Date;
    }>;
    getMesTentatives(userId: string): Promise<({
        quiz: {
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
            dureeMinutes: number | null;
        };
    } & {
        id: string;
        quizId: string;
        apprenantId: string;
        score: import("@prisma/client-runtime-utils").Decimal;
        reponses: import("@prisma/client/runtime/client").JsonValue | null;
        datePassage: Date;
    })[]>;
}
