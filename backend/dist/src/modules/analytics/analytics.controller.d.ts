import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private service;
    constructor(service: AnalyticsService);
    getGlobal(): Promise<{
        etablissements: number;
        apprenants: number;
        formateurs: number;
        formations: number;
        certificatsEmis: number;
        seancesPlanifiees: number;
    }>;
    getEtablissement(id: string, req: any): Promise<{
        etablissementId: string;
        apprenants: number;
        formations: number;
        certificatsEmis: number;
        tauxAssiduite: number;
        tauxCompletion: number;
        moyenneGenerale: number;
    }>;
    getFormation(id: string, req: any): Promise<{
        formationId: string;
        titre: string;
        modules: number;
        cours: number;
        apprenants: number;
        tauxCompletion: number;
        moyenneGenerale: number;
        certificatsEmis: number;
    } | null>;
}
