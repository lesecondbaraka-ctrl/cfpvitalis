import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, ChangePasswordDto, UpdateProfileDto } from './dto/utilisateurs.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { IdentityService } from '../admission/identity.service';
import { Role } from '../../common/enums/role.enum';
import { addDays } from 'date-fns';

@Injectable()
export class UtilisateursService {
  private readonly logger = new Logger(UtilisateursService.name);
  private static failedAttempts = new Map<string, { count: number; lockedUntil?: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
    private identity: IdentityService,
  ) {}

  async register(dto: RegisterDto, ipAdresse: string = '0.0.0.0', auteurId?: string) {
    // BR-01 : Vérifier que l'établissement existe et est actif
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: dto.etablissementId },
    });

    if (!etablissement) {
      throw new ForbiddenException(
        'BR-01 : L\'établissement de rattachement est introuvable.',
      );
    }

    // Vérifier unicité email
    const existingUser = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    // Hacher le mot de passe (bcrypt, 12 rounds)
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.utilisateur.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        password: hashedPassword,
        nom: dto.nom.trim(),
        prenom: dto.prenom.trim(),
        role: Role.APPRENANT,
        etablissementId: dto.etablissementId,
      },
    });

    // Journaliser dans AuditLog
    try {
      await this.prisma.auditLog.create({
        data: {
          auteurId: auteurId || user.id,
          action: 'ENROLEMENT_APPRENANT',
          tableCible: 'utilisateurs',
          details: { message: `Enrôlement officiel de ${user.prenom} ${user.nom}`, role: user.role, etablissementId: user.etablissementId },
          ipAdresse,
        },
      });
    } catch (e: any) {
      this.logger.warn(`Could not persist register audit log: ${e?.message || e}`);
    }

    try {
      await this.identity.ensureProfileFromUser({
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        etablissementId: user.etablissementId,
      });
    } catch (e: any) {
      this.logger.warn(`Profil apprenant non créé à l'inscription : ${e?.message || e}`);
    }

    // Emit notification (real-time) to subscribers
    try {
      this.notificationsService.emit({ type: 'auth', event: 'register', user: { id: user.id, nom: user.nom, prenom: user.prenom }, message: 'Inscription réussie.' });
    } catch {
      // Non-fatal — continue
    }

    const { password, ...result } = user;
    return {
      success: true,
      message: 'Inscription réussie.',
      utilisateur: result,
    };
  }

  async login(dto: LoginDto, ipAdresse: string = '0.0.0.0') {
    const emailNorm = dto.email.toLowerCase().trim();
    const attempts = UtilisateursService.failedAttempts.get(emailNorm);
    const now = new Date();

    // Vérification du verrouillage temporaire (Règle ANSSI)
    if (attempts?.lockedUntil && attempts.lockedUntil > now) {
      const minutesRemaining = Math.ceil((attempts.lockedUntil.getTime() - now.getTime()) / 60000);
      throw new ForbiddenException(
        `Compte temporairement verrouillé pour des raisons de sécurité suite à 5 tentatives infructueuses. Veuillez réessayer dans ${minutesRemaining} minute(s). (Norme ANSSI)`,
      );
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
      include: { etablissement: true },
    });

    const isPasswordValid = user ? await bcrypt.compare(dto.password, user.password) : false;

    if (!user || !isPasswordValid) {
      const curCount = (attempts?.count || 0) + 1;
      let lockedUntil: Date | undefined;
      if (curCount >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Verrouillage 15 minutes
      }
      UtilisateursService.failedAttempts.set(emailNorm, { count: curCount, lockedUntil });

      // Journalisation de sécurité dans AuditLog
      try {
        await this.prisma.auditLog.create({
          data: {
            auteurId: user?.id ?? undefined,
            action: curCount >= 5 ? 'COMPTE_VERROUILLE' : 'ECHEC_CONNEXION',
            tableCible: 'utilisateurs',
            details: { email: emailNorm, tentative: curCount, verrouille: !!lockedUntil },
            ipAdresse,
          },
        });
      } catch (e: any) {
        this.logger.warn(`Could not persist failure audit log: ${e?.message || e}`);
      }

      if (curCount >= 5) {
        throw new ForbiddenException(
          'Compte temporairement verrouillé suite à 5 tentatives infructueuses. Veuillez réessayer dans 15 minutes. (Norme ANSSI)',
        );
      }

      throw new UnauthorizedException('Identifiants incorrects.');
    }

    // Réinitialisation du compteur après succès
    UtilisateursService.failedAttempts.delete(emailNorm);

    // Vérifier si le compte utilisateur est actif
    if (!user.actif) {
      throw new ForbiddenException(
        'Votre compte utilisateur a été désactivé par un administrateur.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      etablissementId: user.etablissementId,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Persist refresh token for revocation capability
    const expiresAt = addDays(new Date(), 7);
    try {
      await (this.prisma as any).refreshToken.create({
        data: {
          token: refreshToken,
          utilisateurId: user.id,
          expiresAt,
        },
      });
    } catch (e: any) {
      this.logger.warn(`Could not persist refresh token: ${e?.message || e}`);
    }

    // Journaliser la connexion
    try {
      await this.prisma.auditLog.create({
        data: {
          auteurId: user.id,
          action: 'CONNEXION',
          tableCible: 'utilisateurs',
          details: { message: `Connexion de ${user.prenom} ${user.nom}` },
          ipAdresse,
        },
      });
    } catch (e: any) {
      this.logger.warn(`Could not persist audit log: ${e?.message || e}`);
    }

    // Emit notification (real-time) to subscribers
    try {
      this.notificationsService.emit({ type: 'auth', event: 'login', user: { id: user.id, nom: user.nom, prenom: user.prenom }, message: 'Connexion réussie.' });
    } catch {
      // Non-fatal
    }

    const { password, ...result } = user;
    return {
      success: true,
      accessToken,
      refreshToken,
      utilisateur: result,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      // Verify refresh token exists and is not revoked
      const stored = await (this.prisma as any).refreshToken.findUnique({ where: { token: refreshToken } });
      if (!stored || stored.revoked) throw new UnauthorizedException('Refresh token invalide ou révoqué.');

      const user = await this.validateUser(payload.sub);
      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        etablissementId: user.etablissementId,
      };
      // Optionally rotate refresh token: revoke old and create new one
      await (this.prisma as any).refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
      const newRefresh = this.jwtService.sign(newPayload, { expiresIn: '7d' });
      const newExpiresAt = addDays(new Date(), 7);
      await (this.prisma as any).refreshToken.create({ data: { token: newRefresh, utilisateurId: user.id, expiresAt: newExpiresAt } });
      return {
        success: true,
        accessToken: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        refreshToken: newRefresh,
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }
  }

  async revokeRefreshToken(refreshToken: string) {
    const stored = await (this.prisma as any).refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) return { success: true };
    await (this.prisma as any).refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
    return { success: true };
  }

  private static readonly userCache = new Map<string, { user: any; expiry: number }>();
  private static readonly USER_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  public invalidateUserValidateCache(userId?: string) {
    if (userId) {
      UtilisateursService.userCache.delete(userId);
    } else {
      UtilisateursService.userCache.clear();
    }
  }

  async validateUser(userId: string) {
    const cached = UtilisateursService.userCache.get(userId);
    if (cached && cached.expiry > Date.now()) {
      return cached.user;
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      include: { etablissement: true },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }
    if (!user.actif) {
      throw new UnauthorizedException('Compte utilisateur désactivé.');
    }
    const { password, ...result } = user;
    UtilisateursService.userCache.set(userId, {
      user: result,
      expiry: Date.now() + UtilisateursService.USER_CACHE_TTL,
    });
    return result;
  }

  async findAll() {
    const users = await this.prisma.utilisateur.findMany({
      select: {
        id: true, email: true, nom: true, prenom: true, role: true,
        etablissementId: true, actif: true, createdAt: true,
        etablissement: { select: { nom: true } },
      },
      orderBy: [{ etablissementId: 'asc' }, { nom: 'asc' }],
    });
    return users;
  }

  async findByEtablissement(etablissementId: string) {
    return this.prisma.utilisateur.findMany({
      where: { etablissementId },
      select: {
        id: true, email: true, nom: true, prenom: true, role: true, actif: true, createdAt: true,
        etablissement: { select: { nom: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  async setActif(userId: string, actif: boolean, auteurId: string, ipAdresse: string) {
    // Vérifier si l'utilisateur existe
    const targetUser = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    // Mettre à jour le statut actif
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { actif },
    });

    this.invalidateUserValidateCache(userId);

    // Journaliser dans AuditLog
    await this.prisma.auditLog.create({
      data: {
        auteurId,
        action: actif ? 'ACTIVATION_UTILISATEUR' : 'DESACTIVATION_UTILISATEUR',
        details: { userId, action: actif ? 'activation' : 'désactivation' },
        ipAdresse,
      },
    });
    return { success: true, message: `Utilisateur ${actif ? 'activé' : 'désactivé'}.` };
  }

  /**
   * Changement sécurisé de mot de passe par l'utilisateur connecté
   */
  async changePassword(userId: string, dto: ChangePasswordDto, ipAdresse: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    // Vérifier l'ancien mot de passe
    const passwordValid = await bcrypt.compare(dto.ancienMotDePasse, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('L\'ancien mot de passe est incorrect.');
    }

    // Hacher le nouveau mot de passe (12 rounds)
    const newHashedPassword = await bcrypt.hash(dto.nouveauMotDePasse, 12);

    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    this.invalidateUserValidateCache(userId);

    // Journaliser dans AuditLog
    try {
      await this.prisma.auditLog.create({
        data: {
          auteurId: userId,
          action: 'CHANGEMENT_MOT_DE_PASSE',
          details: { userId, message: 'Mot de passe modifié avec succès' },
          ipAdresse,
        },
      });
    } catch {}

    return { success: true, message: 'Mot de passe mis à jour avec succès.' };
  }

  /**
   * Mise à jour des informations de profil
   */
  async updateProfile(userId: string, dto: UpdateProfileDto, ipAdresse: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const updated = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: {
        nom: dto.nom.trim(),
        prenom: dto.prenom.trim(),
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        actif: true,
        etablissementId: true,
        etablissement: {
          select: { id: true, nom: true, codeAntenne: true },
        },
      },
    });

    this.invalidateUserValidateCache(userId);

    try {
      await this.prisma.auditLog.create({
        data: {
          auteurId: userId,
          action: 'MODIFICATION_PROFIL',
          details: { userId, nom: dto.nom, prenom: dto.prenom },
          ipAdresse,
        },
      });
    } catch {}

    return { success: true, message: 'Profil mis à jour.', utilisateur: updated };
  }
}


