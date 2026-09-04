import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { Role } from '../../common/enums/role.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DevoirsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private notifications: NotificationsService,
  ) {}

  private async assertModuleAccess(moduleId: string, user: any) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: { formation: true },
    });
    if (!mod) throw new NotFoundException('Module introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && mod.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return mod;
  }

  async create(moduleId: string, data: { titre: string; consignes?: string; dateLimite?: string }, user: any) {
    await this.assertModuleAccess(moduleId, user);
    return this.prisma.devoir.create({
      data: {
        moduleId,
        titre: data.titre,
        consignes: data.consignes,
        dateLimite: data.dateLimite ? new Date(data.dateLimite) : undefined,
      },
    });
  }

  async findByModule(moduleId: string, user: any) {
    await this.assertModuleAccess(moduleId, user);
    return this.prisma.devoir.findMany({
      where: { moduleId },
      include: { _count: { select: { soumissions: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    const devoir = await this.prisma.devoir.findUnique({
      where: { id },
      include: {
        module: { include: { formation: true } },
        soumissions: {
          include: { apprenant: { select: { id: true, nom: true, prenom: true, email: true } } },
        },
      },
    });
    if (!devoir) throw new NotFoundException('Devoir introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && devoir.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }

    if (user.role === Role.APPRENANT) {
      return {
        ...devoir,
        soumissions: devoir.soumissions.filter((s) => s.apprenantId === user.id),
      };
    }

    return devoir;
  }

  async submit(devoirId: string, file: Express.Multer.File, user: any) {
    if (user.role !== Role.APPRENANT) throw new ForbiddenException('Réservé aux apprenants.');
    const devoir = await this.findOne(devoirId, user);
    if (devoir.dateLimite && new Date() > devoir.dateLimite) {
      throw new BadRequestException('La date limite de dépôt est dépassée.');
    }
    const fileUrl = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype, 'devoirs');
    return this.prisma.soumissionDevoir.upsert({
      where: { devoirId_apprenantId: { devoirId, apprenantId: user.id } },
      update: { fileUrl, dateDepot: new Date() },
      create: { devoirId, apprenantId: user.id, fileUrl },
    });
  }

  async noter(devoirId: string, apprenantId: string, note: number, commentaire: string, user: any) {
    const devoir = await this.findOne(devoirId, user);
    const soumission = await this.prisma.soumissionDevoir.update({
      where: { devoirId_apprenantId: { devoirId, apprenantId } },
      data: { note, commentaire },
    });

    // ─── Push temps réel : notifier l'apprenant que son devoir a été noté ───
    this.notifications.emit({
      type: 'DEVOIR_NOTE',
      recipientUserId: apprenantId,
      title: 'Devoir noté !',
      message: `Votre devoir « ${devoir.titre} » a été noté : ${note}/20.${commentaire ? ' ' + commentaire : ''}`,
      data: { devoirId, devoirTitre: devoir.titre, note, commentaire, soumissionId: soumission.id },
    });

    return soumission;
  }

  async mesSoumissions(userId: string) {
    return this.prisma.soumissionDevoir.findMany({
      where: { apprenantId: userId },
      include: { devoir: { include: { module: { include: { formation: { select: { titre: true } } } } } } },
      orderBy: { dateDepot: 'desc' },
    });
  }

  async update(id: string, data: { titre?: string; consignes?: string; dateLimite?: string }, user: any) {
    const devoir = await this.prisma.devoir.findUnique({
      where: { id },
      include: { module: { include: { formation: true } } },
    });
    if (!devoir) throw new NotFoundException('Devoir introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && devoir.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.prisma.devoir.update({
      where: { id },
      data: {
        titre: data.titre,
        consignes: data.consignes,
        dateLimite: data.dateLimite ? new Date(data.dateLimite) : undefined,
      },
    });
  }

  async delete(id: string, user: any) {
    const devoir = await this.prisma.devoir.findUnique({
      where: { id },
      include: { module: { include: { formation: true } } },
    });
    if (!devoir) throw new NotFoundException('Devoir introuvable.');
    if (user.role !== Role.ADMIN_CENTRE && devoir.module.formation.etablissementId !== user.etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.prisma.devoir.delete({ where: { id } });
  }
}
