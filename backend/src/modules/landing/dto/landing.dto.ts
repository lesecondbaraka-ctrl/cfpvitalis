import { IsString, IsOptional, IsInt, IsBoolean, Min, Max, MaxLength, MinLength, Matches } from 'class-validator';

export class UpdateLandingSettingsDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;

  @IsOptional()
  @IsString()
  heroTitre?: string;

  @IsOptional()
  @IsString()
  heroSousTitre?: string;

  @IsOptional()
  @IsString()
  heroNumeroAgrement?: string;

  @IsOptional()
  @IsString()
  topbarTexte?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  statsLaureats?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  statsTauxReussite?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  statsFilieres?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  statsTitresVerif?: number;

  @IsOptional()
  @IsString()
  ctaTitre?: string;

  @IsOptional()
  @IsString()
  ctaSousTitre?: string;

  @IsOptional()
  @IsString()
  formationsSurMesureTitre?: string;

  @IsOptional()
  @IsString()
  formationsSurMesureDescription?: string;

  @IsOptional()
  @IsString()
  verifTitre?: string;

  @IsOptional()
  @IsString()
  verifSousTitre?: string;

  @IsOptional()
  @IsString()
  verifExempleNumero?: string;

  @IsOptional()
  @IsString()
  contactAdresse?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactHoraires?: string;

  @IsOptional()
  @IsString()
  contactTelephone?: string;

  @IsOptional()
  @IsString()
  footerDescription?: string;

  @IsOptional()
  @IsString()
  footerTutelleTexte?: string;

  @IsOptional()
  @IsString()
  footerCopyright?: string;

  @IsOptional()
  @IsString()
  footerBarreTexte?: string;
}

export class CreateLandingSectionDto {
  @IsString()
  typeSection: string; // 'avantage' | 'pedagogie' | 'admission' | 'secteur' | 'faq'

  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  sousTitre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  ordre?: number;

  @IsOptional()
  @IsString()
  couleur?: string;

  @IsOptional()
  @IsString()
  icone?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class UpdateLandingSectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;

  @IsOptional()
  @IsString()
  typeSection?: string;

  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  sousTitre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  ordre?: number;

  @IsOptional()
  @IsString()
  couleur?: string;

  @IsOptional()
  @IsString()
  icone?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class CreateLandingTemoignageDto {
  @IsString()
  nom: string;

  @IsString()
  initiales: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  promotion?: string;

  @IsString()
  citation: string;

  @IsOptional()
  @IsString()
  couleur?: string;

  @IsOptional()
  @IsInt()
  ordre?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class UpdateLandingTemoignageDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;

  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  initiales?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  promotion?: string;

  @IsOptional()
  @IsString()
  citation?: string;

  @IsOptional()
  @IsString()
  couleur?: string;

  @IsOptional()
  @IsInt()
  ordre?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class ContactMessageDto {
  @IsString()
  @MinLength(2, { message: 'Le nom doit comporter au moins 2 caractères.' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères.' })
  nom: string;

  @IsString()
  @Matches(/^[+]?[0-9\s\-().]{6,25}$/, {
    message: 'Numéro de téléphone invalide (ex: +243 81 234 56 78).',
  })
  telephone: string;

  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Le nom de filière ne peut pas dépasser 150 caractères.' })
  filiere?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Le message ne peut pas dépasser 2000 caractères.' })
  message?: string;
}

export class CreateLandingActualiteDto {
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  chapeau?: string;

  @IsOptional()
  @IsString()
  contenu?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  badgeCouleur?: string;

  @IsOptional()
  @IsString()
  datePublication?: string;

  @IsOptional()
  @IsString()
  auteur?: string;

  @IsOptional()
  @IsBoolean()
  aLaUne?: boolean;

  @IsOptional()
  @IsInt()
  ordre?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

export class UpdateLandingActualiteDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  createdAt?: any;

  @IsOptional()
  updatedAt?: any;

  @IsOptional()
  @IsString()
  titre?: string;

  @IsOptional()
  @IsString()
  chapeau?: string;

  @IsOptional()
  @IsString()
  contenu?: string;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  badgeCouleur?: string;

  @IsOptional()
  @IsString()
  datePublication?: string;

  @IsOptional()
  @IsString()
  auteur?: string;

  @IsOptional()
  @IsBoolean()
  aLaUne?: boolean;

  @IsOptional()
  @IsInt()
  ordre?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
