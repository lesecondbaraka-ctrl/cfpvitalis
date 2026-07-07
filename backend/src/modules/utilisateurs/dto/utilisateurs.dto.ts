import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class RegisterDto {
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis.' })
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  prenom: string;

  @IsEnum(Role, { message: 'Rôle invalide.' })
  role: Role;

  @IsString()
  @IsNotEmpty({ message: 'BR-01 : L\'établissement de rattachement est obligatoire.' })
  etablissementId: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  password: string;
}
