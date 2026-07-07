import { QuizService } from './quiz.service';
export declare class QuizController {
    private service;
    constructor(service: QuizService);
    mesTentatives(req: any): Promise<({
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
    create(moduleId: string, body: any, req: any): Promise<{
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
    findByModule(moduleId: string, req: any): Promise<({
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
    findOne(id: string, req: any): Promise<({
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
    submit(id: string, body: {
        reponses: {
            questionId: string;
            selectedIndex: number;
        }[];
    }, req: any): Promise<{
        id: string;
        quizId: string;
        apprenantId: string;
        score: import("@prisma/client-runtime-utils").Decimal;
        reponses: import("@prisma/client/runtime/client").JsonValue | null;
        datePassage: Date;
    }>;
}
