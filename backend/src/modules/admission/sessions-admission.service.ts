import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import { CreateSessionAdmissionDto, UpdateSessionStatutDto } from './dto/admission.dto';
import { statut_session_admission } from '@prisma/client';

@Injectable()
export class SessionsAdmissionService {
  constructor(private prisma: PrismaService) {}

  private canManage(user: any, etablissementId: string) {
    if (user.role === Role.ADMIN_CENTRE) return;
    if (user.etablissementId === etablissementId) return;
    throw new ForbiddenException('BR-02 : Accès interdit à cette session.');
  }

  async listPublic() {
    const now = new Date();
    return this.prisma.sessionAdmission.findMany({
      where: {
        statut: statut_session_admission.OUVERTE,
        dateOuverture: { lte: now },
        dateFermeture: { gte: now },
        etablissement: { statut: 'ACTIF' },
      },
      include: {
        filiere: true,
        niveau: true,
        etablissement: { select: { id: true, nom: true, codeAntenne: true, pays: true, typeEtablissement: true } },
      },
      orderBy: { dateFermeture: 'asc' },
    });
  }

  async list(user: any) {
    const where = user.role === Role.ADMIN_CENTRE ? {} : { etablissementId: user.etablissementId };
    return this.prisma.sessionAdmission.findMany({
      where,
      include: {
        filiere: true,
        niveau: true,
        etablissement: { select: { id: true, nom: true, codeAntenne: true } },
        _count: { select: { candidatures: true } },
      },
      orderBy: { dateOuverture: 'desc' },
    });
  }

  async findOne(id: string, user?: any) {
    const session = await this.prisma.sessionAdmission.findUnique({
      where: { id },
      include: {
        filiere: true,
        niveau: true,
        formation: { select: { id: true, titre: true } },
        etablissement: { select: { id: true, nom: true, codeAntenne: true, pays: true, reglementLocal: true } },
      },
    });
    if (!session) throw new NotFoundException('Session d’admission introuvable.');
    if (user && user.role !== Role.APPRENANT) this.canManage(user, session.etablissementId);
    return session;
  }

  async create(dto: CreateSessionAdmissionDto, user: any) {
    if (user.role !== Role.ADMIN_CENTRE && user.role !== Role.ADMIN_ETABLISSEMENT && user.role !== Role.PERSONNEL_ADMINISTRATIF) {
      throw new ForbiddenException('Création de session non autorisée.');
    }

    let etablissementId = dto.etablissementId || user.etablissementId;
    if (!etablissementId && user.role === Role.ADMIN_CENTRE) {
      const defaultEtab = await this.prisma.etablissement.findFirst({
        where: { statut: 'ACTIF' },
        orderBy: { typeEtablissement: 'asc' },
      });
      etablissementId = defaultEtab?.id;
    }

    if (!etablissementId) {
      throw new BadRequestException('Veuillez sélectionner un établissement pour cette session.');
    }

    const etab = await this.prisma.etablissement.findUnique({ where: { id: etablissementId } });
    if (!etab) throw new NotFoundException('Établissement introuvable.');
    const autonomie = (etab.parametresAutonomie as { peutCreerSessions?: boolean } | null) ?? {};
    if (user.role !== Role.ADMIN_CENTRE && autonomie.peutCreerSessions === false) {
      throw new ForbiddenException('Ce satellite n’est pas habilité à créer des sessions.');
    }

    if (new Date(dto.dateFermeture) <= new Date(dto.dateOuverture)) {
      throw new BadRequestException('La date de fermeture doit être postérieure à l’ouverture.');
    }

    return this.prisma.sessionAdmission.create({
      data: {
        etablissementId,
        filiereId: dto.filiereId,
        niveauId: dto.niveauId,
        formationId: dto.formationId,
        libelle: dto.libelle,
        modeSelection: dto.modeSelection,
        capacite: dto.capacite ?? 30,
        dateOuverture: new Date(dto.dateOuverture),
        dateFermeture: new Date(dto.dateFermeture),
        dateDebutFormation: new Date(dto.dateDebutFormation),
        delaiConfirmationJours: dto.delaiConfirmationJours,
      },
      include: {
        filiere: true,
        niveau: true,
        etablissement: { select: { id: true, nom: true, codeAntenne: true } },
        _count: { select: { candidatures: true } },
      },
    });
  }

  async updateStatut(id: string, dto: UpdateSessionStatutDto, user: any) {
    const session = await this.findOne(id, user);
    return this.prisma.sessionAdmission.update({
      where: { id: session.id },
      data: { statut: dto.statut },
      include: {
        filiere: true,
        niveau: true,
        etablissement: { select: { id: true, nom: true, codeAntenne: true } },
        _count: { select: { candidatures: true } },
      },
    });
  }

  async stats(id: string, user: any) {
    const session = await this.findOne(id, user);
    const grouped = await this.prisma.candidature.groupBy({
      by: ['statut'],
      where: { sessionId: id },
      _count: true,
    });
    const placesPrises = await this.prisma.candidature.count({
      where: { sessionId: id, statut: { in: ['ADMISE', 'CONFIRMEE', 'INSCRITE'] } },
    });
    return {
      sessionId: id,
      capacite: session.capacite,
      placesPrises,
      placesRestantes: Math.max(0, session.capacite - placesPrises),
      parStatut: Object.fromEntries(grouped.map((g) => [g.statut, g._count])),
    };
  }
}
