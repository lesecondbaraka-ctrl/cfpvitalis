import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/utilisateurs.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UtilisateursService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async register(dto: RegisterDto, ipAdresse: string = '0.0.0.0') {
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
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    // Hacher le mot de passe (bcrypt, 12 rounds)
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.utilisateur.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nom: dto.nom,
        prenom: dto.prenom,
        role: dto.role,
        etablissementId: dto.etablissementId,
      },
    });

    // Journaliser dans AuditLog
    await this.prisma.auditLog.create({
      data: {
        auteurId: user.id,
        action: 'INSCRIPTION',
        details: { message: `Inscription de ${user.prenom} ${user.nom}`, role: user.role },
        ipAdresse,
      },
    });

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
    const user = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
      include: { etablissement: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    // L'établissement existe obligatoirement en raison de la clé étrangère.

    // Vérifier si le compte utilisateur est actif
    if (!user.actif) {
      throw new ForbiddenException(
        'Votre compte utilisateur a été désactivé par un administrateur.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      etablissementId: user.etablissementId,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Journaliser la connexion
    await this.prisma.auditLog.create({
      data: {
        auteurId: user.id,
        action: 'CONNEXION',
        details: { message: `Connexion de ${user.prenom} ${user.nom}` },
        ipAdresse,
      },
    });

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
      const user = await this.validateUser(payload.sub);
      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        etablissementId: user.etablissementId,
      };
      return {
        success: true,
        accessToken: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré.');
    }
  }

  async validateUser(userId: string) {
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
}

