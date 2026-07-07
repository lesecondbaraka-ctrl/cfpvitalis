import { PrismaService } from '../../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getGlobalKpi(): Promise<{
        etablissements: number;
        apprenants: number;
        formateurs: number;
        formations: number;
        certificatsEmis: number;
        seancesPlanifiees: number;
    }>;
    getEtablissementKpi(etablissementId: string, user: any): Promise<{
        etablissementId: string;
        apprenants: number;
        formations: number;
        certificatsEmis: number;
        tauxAssiduite: number;
        tauxCompletion: number;
        moyenneGenerale: number;
    }>;
    getFormationStats(formationId: string, user: any): Promise<{
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
