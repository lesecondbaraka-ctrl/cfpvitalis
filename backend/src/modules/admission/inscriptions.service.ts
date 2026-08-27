import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IdentityService } from './identity.service';
import { Role } from '../../common/enums/role.enum';
import { UpdateInscriptionStatutDto } from './dto/admission.dto';
import { statut_inscription } from '@prisma/client';

@Injectable()
export class InscriptionsService {
  constructor(
    private prisma: PrismaService,
    private identity: IdentityService,
  ) {}

  async mesFormations(user: any) {
    const profile = await this.identity.ensureProfileFromUser(user);
    return this.prisma.inscription.findMany({
      where: { apprenantId: profile.id, statut: { in: [statut_inscription.ACTIVE, statut_inscription.RESERVEE] } },
      include: { formation: { select: { id: true, titre: true, description: true, etablissementId: true } } },
      orderBy: { dateDebut: 'desc' },
    });
  }

  async byEtablissement(etablissementId: string, user: any) {
    if (user.role !== Role.ADMIN_CENTRE && user.etablissementId !== etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.prisma.inscription.findMany({
      where: { formation: { etablissementId } },
      include: {
        apprenant: { select: { id: true, matricule: true, nom: true, prenom: true, email: true } },
        formation: { select: { id: true, titre: true } },
      },
      orderBy: { dateDebut: 'desc' },
    });
  }

  async updateStatut(id: string, dto: UpdateInscriptionStatutDto, user: any) {
    const insc = await this.prisma.inscription.findUnique({
      where: { id },
      include: { formation: true },
    });
    if (!insc) throw new NotFoundException('Inscription introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && user.etablissementId !== insc.formation.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.prisma.inscription.update({
      where: { id },
      data: {
        statut: dto.statut,
        dateFin: ['TERMINEE', 'ABANDONNEE', 'ANNULEE'].includes(dto.statut) ? new Date() : insc.dateFin,
      },
    });
  }
}
