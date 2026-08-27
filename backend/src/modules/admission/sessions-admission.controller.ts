import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { SessionsAdmissionService } from './sessions-admission.service';
import { CreateSessionAdmissionDto, UpdateSessionStatutDto } from './dto/admission.dto';

@Controller('sessions-admission')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsAdmissionController {
  constructor(private service: SessionsAdmissionService) {}

  @Get('public')
  @Public()
  listPublic() {
    return this.service.listPublic();
  }

  @Get()
  @UseGuards(EtablissementGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  list(@Req() req: any) {
    return this.service.list(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Post()
  @UseGuards(EtablissementGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  create(@Body() dto: CreateSessionAdmissionDto, @Req() req: any) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id/statut')
  @UseGuards(EtablissementGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  updateStatut(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSessionStatutDto, @Req() req: any) {
    return this.service.updateStatut(id, dto, req.user);
  }

  @Get(':id/stats')
  @UseGuards(EtablissementGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  stats(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.stats(id, req.user);
  }
}
