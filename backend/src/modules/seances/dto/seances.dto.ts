import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { type_seance, statut_presence } from '@prisma/client';

export class CreateSeanceDto {
  @IsUUID()
  moduleId: string;

  @IsOptional()
  @IsUUID()
  coursId?: string;

  @IsString()
  titreActivite: string;

  @IsEnum(type_seance)
  typeSession: type_seance;

  @IsDateString()
  dateHeureDebut: string;

  @IsDateString()
  dateHeureFin: string;

  @IsOptional()
  @IsString()
  salleOuLien?: string;
}

export class UpdateSeanceDto {
  @IsOptional() @IsString() titreActivite?: string;
  @IsOptional() @IsEnum(type_seance) typeSession?: type_seance;
  @IsOptional() @IsDateString() dateHeureDebut?: string;
  @IsOptional() @IsDateString() dateHeureFin?: string;
  @IsOptional() @IsString() salleOuLien?: string;
}

export class EmargementDto {
  @IsUUID()
  apprenantId: string;

  @IsEnum(statut_presence)
  statut: statut_presence;

  @IsOptional()
  @IsString()
  remarqueJustification?: string;
}

export class BulkEmargementDto {
  presences: EmargementDto[];
}
