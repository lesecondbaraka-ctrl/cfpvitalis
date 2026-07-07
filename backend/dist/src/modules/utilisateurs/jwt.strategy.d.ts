import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UtilisateursService } from './utilisateurs.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private utilisateursService;
    constructor(configService: ConfigService, utilisateursService: UtilisateursService);
    validate(payload: any): Promise<{
        etablissement: {
            id: string;
            codeAntenne: string;
            nom: string;
            adresse: string | null;
            createdAt: Date | null;
            updatedAt: Date | null;
        };
        id: string;
        nom: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        email: string;
        etablissementId: string;
        prenom: string;
        role: import("@prisma/client").$Enums.utilisateur_role;
        actif: boolean | null;
    }>;
}
export {};
