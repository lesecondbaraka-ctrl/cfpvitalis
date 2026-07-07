import { SeancesService } from './seances.service';
import { CreateSeanceDto, UpdateSeanceDto, BulkEmargementDto } from './dto/seances.dto';
export declare class SeancesController {
    private service;
    constructor(service: SeancesService);
    create(dto: CreateSeanceDto, req: any): Promise<{
        module: {
            id: string;
            createdAt: Date | null;
            titre: string;
            formationId: string;
            ordre: number;
            coefficient: import("@prisma/client-runtime-utils").Decimal | null;
        };
        formateur: {
            nom: string;
            prenom: string;
        };
    } & {
        id: string;
        createdAt: Date | null;
        moduleId: string;
        coursId: string | null;
        formateurId: string;
        titreActivite: string;
        typeSession: import("@prisma/client").$Enums.type_seance;
        dateHeureDebut: Date;
        dateHeureFin: Date;
        salleOuLien: string | null;
    }>;
    findAll(req: any): Promise<({
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
        formateur: {
            nom: string;
            prenom: string;
        };
        _count: {
            presences: number;
        };
    } & {
        id: string;
        createdAt: Date | null;
        moduleId: string;
        coursId: string | null;
        formateurId: string;
        titreActivite: string;
        typeSession: import("@prisma/client").$Enums.type_seance;
        dateHeureDebut: Date;
        dateHeureFin: Date;
        salleOuLien: string | null;
    })[]>;
    findByModule(moduleId: string, req: any): Promise<({
        formateur: {
            nom: string;
            prenom: string;
        };
        _count: {
            presences: number;
        };
    } & {
        id: string;
        createdAt: Date | null;
        moduleId: string;
        coursId: string | null;
        formateurId: string;
        titreActivite: string;
        typeSession: import("@prisma/client").$Enums.type_seance;
        dateHeureDebut: Date;
        dateHeureFin: Date;
        salleOuLien: string | null;
    })[]>;
    getAssiduite(apprenantId: string, req: any): Promise<{
        total: number;
        present: number;
        absent: number;
        tauxAssiduite: number;
    }>;
    findOne(id: string, req: any): Promise<{
        presences: ({
            utilisateur: {
                id: string;
                nom: string;
                email: string;
                prenom: string;
            };
        } & {
            seanceId: string;
            utilisateurId: string;
            statut: import("@prisma/client").$Enums.statut_presence;
            remarqueJustification: string | null;
            misAJourA: Date | null;
        })[];
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
        formateur: {
            id: string;
            nom: string;
            prenom: string;
        };
    } & {
        id: string;
        createdAt: Date | null;
        moduleId: string;
        coursId: string | null;
        formateurId: string;
        titreActivite: string;
        typeSession: import("@prisma/client").$Enums.type_seance;
        dateHeureDebut: Date;
        dateHeureFin: Date;
        salleOuLien: string | null;
    }>;
    update(id: string, dto: UpdateSeanceDto, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        moduleId: string;
        coursId: string | null;
        formateurId: string;
        titreActivite: string;
        typeSession: import("@prisma/client").$Enums.type_seance;
        dateHeureDebut: Date;
        dateHeureFin: Date;
        salleOuLien: string | null;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date | null;
        moduleId: string;
        coursId: string | null;
        formateurId: string;
        titreActivite: string;
        typeSession: import("@prisma/client").$Enums.type_seance;
        dateHeureDebut: Date;
        dateHeureFin: Date;
        salleOuLien: string | null;
    }>;
    emargement(id: string, dto: BulkEmargementDto, req: any): Promise<{
        success: boolean;
        presences: {
            seanceId: string;
            utilisateurId: string;
            statut: import("@prisma/client").$Enums.statut_presence;
            remarqueJustification: string | null;
            misAJourA: Date | null;
        }[];
    }>;
    getApprenants(id: string, req: any): Promise<{
        id: string;
        nom: string;
        email: string;
        prenom: string;
    }[]>;
}
