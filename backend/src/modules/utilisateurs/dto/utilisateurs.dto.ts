import { IsEmail, IsNotEmpty, IsString, MinLength, IsUUID, IsBoolean, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email: string;

  @IsString()
  @MinLength(12, { message: 'Le mot de passe doit contenir au moins 12 caractères (Recommandation ANSSI).' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#~^+=<>[\]{}()|:;,.]).+$/,
    {
      message:
        'Le mot de passe doit comporter au moins une majuscule, une minuscule, un chiffre et un caractère spécial.',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis.' })
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  prenom: string;

  @IsUUID('4', { message: 'Identifiant d\'établissement invalide.' })
  etablissementId: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Adresse email invalide.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est requis.' })
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class SetActifDto {
  @IsBoolean()
  actif: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'ancien mot de passe est requis.' })
  ancienMotDePasse: string;

  @IsString()
  @MinLength(12, { message: 'Le mot de passe doit contenir au moins 12 caractères (Norme ANSSI).' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#~^+=<>[\]{}()|:;,.]).+$/,
    {
      message:
        'Le nouveau mot de passe doit comporter au moins une majuscule, une minuscule, un chiffre et un caractère spécial.',
    },
  )
  nouveauMotDePasse: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis.' })
  nom: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis.' })
  prenom: string;
}

