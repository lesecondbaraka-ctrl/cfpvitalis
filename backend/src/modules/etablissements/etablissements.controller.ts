import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { EtablissementsService } from './etablissements.service';

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

  @Get(':id')
  @UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  findOne(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== Role.ADMIN_CENTRE && req.user.etablissementId !== id) {
      throw new ForbiddenException('BR-02 : Accès interdit.');
    }
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN_CENTRE)
  create(@Body() data: { nom: string; adresse: string; codeAntenne?: string }) {
    return this.service.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN_CENTRE)
  update(@Param('id') id: string, @Body() data: { nom?: string; adresse?: string }) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_CENTRE)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
