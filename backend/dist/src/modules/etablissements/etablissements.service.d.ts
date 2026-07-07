import { PrismaService } from '../../prisma/prisma.service';
export declare class EtablissementsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllPublic(): Promise<{
        id: string;
        codeAntenne: string;
        nom: string;
    }[]>;
    findAll(): Promise<({
        _count: {
            formations: number;
            utilisateurs: number;
        };
    } & {
        id: string;
        codeAntenne: string;
        nom: string;
        adresse: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        formations: {
            id: string;
            titre: string;
        }[];
        utilisateurs: {
            id: string;
            nom: string;
            email: string;
            prenom: string;
            role: import("@prisma/client").$Enums.utilisateur_role;
        }[];
    } & {
        id: string;
        codeAntenne: string;
        nom: string;
        adresse: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    create(data: {
        nom: string;
        adresse: string;
        codeAntenne?: string;
    }): Promise<{
        id: string;
        codeAntenne: string;
        nom: string;
        adresse: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    update(id: string, data: {
        nom?: string;
        adresse?: string;
    }): Promise<{
        id: string;
        codeAntenne: string;
        nom: string;
        adresse: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        codeAntenne: string;
        nom: string;
        adresse: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
}
