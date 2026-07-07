import {
  Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { SeancesService } from './seances.service';
import { CreateSeanceDto, UpdateSeanceDto, BulkEmargementDto } from './dto/seances.dto';

@Controller('seances')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
export class SeancesController {
  constructor(private service: SeancesService) {}

  @Post()
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  create(@Body() dto: CreateSeanceDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Get()
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.PERSONNEL_ADMINISTRATIF, Role.APPRENANT)
  findAll(@Req() req: any) {
    return this.service.findByEtablissement(req.user);
  }

  @Get('module/:moduleId')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.PERSONNEL_ADMINISTRATIF)
  findByModule(@Param('moduleId') moduleId: string, @Req() req: any) {
    return this.service.findByModule(moduleId, req.user);
  }

  @Get('apprenant/:apprenantId/assiduite')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.PERSONNEL_ADMINISTRATIF, Role.APPRENANT)
  getAssiduite(@Param('apprenantId') apprenantId: string, @Req() req: any) {
    return this.service.getAssiduite(apprenantId, req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.PERSONNEL_ADMINISTRATIF, Role.APPRENANT)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Put(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  update(@Param('id') id: string, @Body() dto: UpdateSeanceDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user);
  }

  @Post(':id/emargement')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.PERSONNEL_ADMINISTRATIF)
  emargement(@Param('id') id: string, @Body() dto: BulkEmargementDto, @Req() req: any) {
    const ip = req.ip || '0.0.0.0';
    return this.service.emargement(id, dto.presences, req.user, ip);
  }

  @Get(':id/apprenants')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.PERSONNEL_ADMINISTRATIF)
  getApprenants(@Param('id') id: string, @Req() req: any) {
    return this.service.getApprenantsSeance(id, req.user);
  }
}
