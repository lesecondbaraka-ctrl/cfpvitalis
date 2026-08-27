import { Controller, Post, Get, Put, Body, Param, Req, HttpCode, HttpStatus, UseGuards, ForbiddenException, ParseUUIDPipe } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { UtilisateursService } from './utilisateurs.service';
import { RegisterDto, LoginDto, RefreshTokenDto, SetActifDto, ChangePasswordDto, UpdateProfileDto } from './dto/utilisateurs.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private utilisateursService: UtilisateursService) {}

  @Post('enroler')
  @UseGuards(JwtAuthGuard, RolesGuard, EtablissementGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  async enroler(@Body() dto: RegisterDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    if (req.user.role !== Role.ADMIN_CENTRE) {
      dto.etablissementId = req.user.etablissementId;
    }
    return this.utilisateursService.register(dto, ip, req.user.id);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard, EtablissementGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  async register(@Body() dto: RegisterDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    if (req.user.role !== Role.ADMIN_CENTRE) {
      dto.etablissementId = req.user.etablissementId;
    }
    return this.utilisateursService.register(dto, ip, req.user.id);
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
  refresh(@Body() dto: RefreshTokenDto) {
    return this.utilisateursService.refreshToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: RefreshTokenDto) {
    return this.utilisateursService.revokeRefreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.utilisateursService.validateUser(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: any) {
    const ip = req.ip || '0.0.0.0';
    return this.utilisateursService.updateProfile(req.user.id, dto, ip);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    const ip = req.ip || '0.0.0.0';
    return this.utilisateursService.changePassword(req.user.id, dto, ip);
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
  findByEtablissement(@Param('etablissementId', ParseUUIDPipe) etablissementId: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN_CENTRE && req.user.etablissementId !== etablissementId) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.utilisateursService.findByEtablissement(etablissementId);
  }

  @Put(':id/activer')
  @UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT)
  async setActif(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetActifDto,
    @Req() req: any,
  ) {
    const ip = req.ip || '0.0.0.0';
    return this.utilisateursService.setActif(id, dto.actif, req.user.id, ip);
  }
}

