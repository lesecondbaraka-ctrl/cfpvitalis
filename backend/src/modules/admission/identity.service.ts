import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IdentityService {
  constructor(private prisma: PrismaService) {}

  async generateMatricule(): Promise<string> {
    const params = await this.prisma.parametresReseau.findFirst();
    const prefix = params?.matriculePrefixe || 'VIT';
    const year = new Date().getFullYear();
    const count = await this.prisma.apprenant.count();
    return `${prefix}-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  async ensureProfileFromUser(user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    etablissementId: string;
  }) {
    const existing = await this.prisma.apprenant.findFirst({
      where: { OR: [{ utilisateurId: user.id }, { email: user.email }] },
    });
    if (existing) {
      if (!existing.utilisateurId) {
        return this.prisma.apprenant.update({
          where: { id: existing.id },
          data: { utilisateurId: user.id },
        });
      }
      return existing;
    }
    return this.prisma.apprenant.create({
      data: {
        matricule: await this.generateMatricule(),
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        utilisateurId: user.id,
        etablissementOrigineId: user.etablissementId,
      },
    });
  }

  async getProfileByUserId(utilisateurId: string) {
    return this.prisma.apprenant.findUnique({ where: { utilisateurId } });
  }
}
