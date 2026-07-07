import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeanceDto, UpdateSeanceDto, EmargementDto } from './dto/seances.dto';
export declare class SeancesService {
    private prisma;
    constructor(prisma: PrismaService);
    private assertModuleAccess;
    create(dto: CreateSeanceDto, user: any): Promise<{
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
    findByModule(moduleId: string, user: any): Promise<({
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
    findByEtablissement(user: any): Promise<({
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
    findOne(id: string, user: any): Promise<{
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
    update(id: string, dto: UpdateSeanceDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
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
    emargement(seanceId: string, presences: EmargementDto[], user: any, ip: string): Promise<{
        success: boolean;
        presences: {
            seanceId: string;
            utilisateurId: string;
            statut: import("@prisma/client").$Enums.statut_presence;
            remarqueJustification: string | null;
            misAJourA: Date | null;
        }[];
    }>;
    getAssiduite(apprenantId: string, user: any): Promise<{
        total: number;
        present: number;
        absent: number;
        tauxAssiduite: number;
    }>;
    getApprenantsSeance(seanceId: string, user: any): Promise<{
        id: string;
        nom: string;
        email: string;
        prenom: string;
    }[]>;
}
