import { Role } from '../../../common/enums/role.enum';
export declare class RegisterDto {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    role: Role;
    etablissementId: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
