import { type_seance, statut_presence } from '@prisma/client';
export declare class CreateSeanceDto {
    moduleId: string;
    coursId?: string;
    titreActivite: string;
    typeSession: type_seance;
    dateHeureDebut: string;
    dateHeureFin: string;
    salleOuLien?: string;
}
export declare class UpdateSeanceDto {
    titreActivite?: string;
    typeSession?: type_seance;
    dateHeureDebut?: string;
    dateHeureFin?: string;
    salleOuLien?: string;
}
export declare class EmargementDto {
    apprenantId: string;
    statut: statut_presence;
    remarqueJustification?: string;
}
export declare class BulkEmargementDto {
    presences: EmargementDto[];
}
