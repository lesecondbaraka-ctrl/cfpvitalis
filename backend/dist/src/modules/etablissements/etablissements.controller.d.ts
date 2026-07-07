import { EtablissementsService } from './etablissements.service';
export declare class EtablissementsController {
    private service;
    constructor(service: EtablissementsService);
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
    findAllPublic(): Promise<{
        id: string;
        codeAntenne: string;
        nom: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
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
