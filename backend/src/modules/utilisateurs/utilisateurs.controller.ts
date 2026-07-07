import { Controller, Post, Get, Put, Body, Param, Req, HttpCode, HttpStatus, UseGuards, ForbiddenException } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { UtilisateursService } from './utilisateurs.service';
import { RegisterDto, LoginDto } from './dto/utilisateurs.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private utilisateursService: UtilisateursService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    return this.utilisateursService.register(dto, ip);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    return this.utilisateursService.login(dto, ip);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() body: { refreshToken: string }) {
    return this.utilisateursService.refreshToken(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, EtablissementGuard)
  async getMe(@Req() req: any) {
    return this.utilisateursService.validateUser(req.user.id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN_CENTRE)
  findAll() {
    return this.utilisateursService.findAll();
  }

  @Get('etablissement/:etablissementId')
  @UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  findByEtablissement(@Param('etablissementId') etablissementId: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN_CENTRE && req.user.etablissementId !== etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.utilisateursService.findByEtablissement(etablissementId);
  }

  @Put(':id/activer')
  @UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT)
  async setActif(
    @Param('id') id: string,
    @Body() body: { actif: boolean },
    @Req() req: any,
  ) {
    const ip = req.ip || '0.0.0.0';
    return this.utilisateursService.setActif(id, body.actif, req.user.id, ip);
  }
}
