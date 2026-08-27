import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Req, ForbiddenException, ParseUUIDPipe } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { EtablissementsService } from './etablissements.service';
import { CreateEtablissementDto, UpdateEtablissementDto } from './dto/etablissements.dto';
import {
  CreateSatelliteDto,
  UpdateAutonomieDto,
  UpdateEtablissementStatutDto,
  UpdateParametresReseauDto,
} from '../admission/dto/admission.dto';

@Controller('etablissements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EtablissementsController {
  constructor(private service: EtablissementsService) {}

  @Get()
  @Roles(Role.ADMIN_CENTRE)
  findAll() {
    return this.service.findAll();
  }

  @Get('list/public')
  @Public()
  findAllPublic() {
    return this.service.findAllPublic();
  }

  @Get('reseau')
  @Roles(Role.ADMIN_CENTRE)
  getReseau() {
    return this.service.getReseau();
  }

  @Get('parametres-reseau')
  @Roles(Role.ADMIN_CENTRE)
  getParametresReseau() {
    return this.service.getParametresReseau();
  }

  @Put('parametres-reseau')
  @Roles(Role.ADMIN_CENTRE)
  updateParametresReseau(@Body() dto: UpdateParametresReseauDto) {
    return this.service.updateParametresReseau(dto);
  }

  @Post('satellites')
  @Roles(Role.ADMIN_CENTRE)
  createSatellite(@Body() dto: CreateSatelliteDto) {
    return this.service.createSatellite(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN_CENTRE && req.user.etablissementId !== id) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN_CENTRE)
  create(@Body() dto: CreateEtablissementDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN_CENTRE)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEtablissementDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/statut')
  @Roles(Role.ADMIN_CENTRE)
  updateStatut(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEtablissementStatutDto) {
    return this.service.updateStatut(id, dto);
  }

  @Patch(':id/autonomie')
  @Roles(Role.ADMIN_CENTRE)
  updateAutonomie(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAutonomieDto) {
    return this.service.updateAutonomie(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_CENTRE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
