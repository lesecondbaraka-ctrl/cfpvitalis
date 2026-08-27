import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFiliereDto,
  CreateNiveauDto,
  CreateFormationReferentielDto,
  CreatePrerequisDto,
} from './dto/admission.dto';

@Injectable()
export class ReferentielService {
  constructor(private prisma: PrismaService) {}

  listFilieres(actifsOnly = false) {
    return this.prisma.filiere.findMany({
      where: actifsOnly ? { actif: true } : undefined,
      orderBy: { ordre: 'asc' },
    });
  }

  createFiliere(dto: CreateFiliereDto) {
    return this.prisma.filiere.create({ data: dto });
  }

  updateFiliere(id: string, dto: Partial<CreateFiliereDto> & { actif?: boolean }) {
    return this.prisma.filiere.update({ where: { id }, data: dto });
  }

  listNiveaux(actifsOnly = false) {
    return this.prisma.niveau.findMany({
      where: actifsOnly ? { actif: true } : undefined,
      orderBy: { ordre: 'asc' },
      include: { prerequis: { include: { niveauRequis: true } } },
    });
  }

  createNiveau(dto: CreateNiveauDto) {
    return this.prisma.niveau.create({ data: dto });
  }

  listFormationsReferentiel() {
    return this.prisma.formationReferentiel.findMany({
      include: { filiere: true, niveau: true },
      orderBy: { libelle: 'asc' },
    });
  }

  createFormationReferentiel(dto: CreateFormationReferentielDto) {
    return this.prisma.formationReferentiel.create({ data: dto });
  }

  async createPrerequis(dto: CreatePrerequisDto) {
    const cible = await this.prisma.niveau.findUnique({ where: { id: dto.niveauCibleId } });
    const requis = await this.prisma.niveau.findUnique({ where: { id: dto.niveauRequisId } });
    if (!cible || !requis) throw new NotFoundException('Niveau introuvable.');
    return this.prisma.prerequisNiveau.create({ data: dto });
  }
}
