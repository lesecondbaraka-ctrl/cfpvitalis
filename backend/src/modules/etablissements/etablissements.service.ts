import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EtablissementsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic() {
    return this.prisma.etablissement.findMany({
      select: { id: true, nom: true, codeAntenne: true },
      orderBy: { nom: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.etablissement.findMany({
      include: { _count: { select: { utilisateurs: true, formations: true } } },
      orderBy: { nom: 'asc' },
    });
  }

  async findOne(id: string) {
    const etab = await this.prisma.etablissement.findUnique({
      where: { id },
      include: {
        utilisateurs: { select: { id: true, nom: true, prenom: true, email: true, role: true } },
        formations: { select: { id: true, titre: true } },
      },
    });
    if (!etab) throw new NotFoundException('Établissement introuvable.');
    return etab;
  }

  async create(data: { nom: string; adresse: string; codeAntenne?: string }) {
    const codeAntenne = data.codeAntenne || 'ANT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    return this.prisma.etablissement.create({
      data: {
        nom: data.nom,
        adresse: data.adresse,
        codeAntenne,
      },
    });
  }

  async update(id: string, data: { nom?: string; adresse?: string }) {
    await this.findOne(id);
    return this.prisma.etablissement.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.etablissement.delete({ where: { id } });
  }
}
