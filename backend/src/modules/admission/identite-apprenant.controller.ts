import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { IdentityService } from './identity.service';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('apprenants')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
export class IdentiteApprenantController {
  constructor(
    private identity: IdentityService,
    private prisma: PrismaService,
  ) {}

  @Get('moi')
  @Roles(Role.APPRENANT)
  async moi(@Req() req: any) {
    const profile = await this.identity.ensureProfileFromUser(req.user);
    const [candidatures, inscriptions, validations] = await Promise.all([
      this.prisma.candidature.count({ where: { apprenantId: profile.id } }),
      this.prisma.inscription.findMany({
        where: { apprenantId: profile.id },
        include: { formation: { select: { titre: true } } },
      }),
      this.prisma.validationNiveau.findMany({
        where: { apprenantId: profile.id },
        include: { niveau: true, filiere: true },
      }),
    ]);
    return { ...profile, candidatures, inscriptions, validations };
  }
}
