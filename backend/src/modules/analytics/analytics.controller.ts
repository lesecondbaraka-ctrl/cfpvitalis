import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('global')
  @Roles(Role.ADMIN_CENTRE)
  getGlobal() {
    return this.service.getGlobalKpi();
  }

  @Get('etablissement/:id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  getEtablissement(@Param('id') id: string, @Req() req: any) {
    return this.service.getEtablissementKpi(id, req.user);
  }

  @Get('formation/:id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  getFormation(@Param('id') id: string, @Req() req: any) {
    return this.service.getFormationStats(id, req.user);
  }
}
