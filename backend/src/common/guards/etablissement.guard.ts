import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * BR-01 : Rattachement Obligatoire
 * Vérifie que l'utilisateur appartient à un établissement actif.
 * Aucun utilisateur "flottant" n'est autorisé.
 */
@Injectable()
export class EtablissementGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié.');
    }

    // BR-01 Exception : ADMIN_CENTRE supervise le réseau et APPRENANT candidate au niveau du réseau
    if (user.role === 'ADMIN_CENTRE' || user.role === 'APPRENANT') {
      return true;
    }

    if (!user.etablissementId) {
      throw new ForbiddenException(
        'BR-01 : Tout personnel ou administrateur doit être rattaché à un établissement physique actif.',
      );
    }

    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: user.etablissementId },
    });

    if (!etablissement) {
      throw new ForbiddenException(
        'BR-01 : L\'établissement de rattachement est introuvable.',
      );
    }

    return true;
  }
}
