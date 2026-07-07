import {
  Controller, Get, Post, Put, Param, Body, Req, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { DevoirsService } from './devoirs.service';

@Controller('devoirs')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
export class DevoirsController {
  constructor(private service: DevoirsService) {}

  @Post('module/:moduleId')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  create(@Param('moduleId') moduleId: string, @Body() body: any, @Req() req: any) {
    return this.service.create(moduleId, body, req.user);
  }

  @Get('module/:moduleId')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT)
  findByModule(@Param('moduleId') moduleId: string, @Req() req: any) {
    return this.service.findByModule(moduleId, req.user);
  }

  @Get('mes/soumissions')
  @Roles(Role.APPRENANT)
  mesSoumissions(@Req() req: any) {
    return this.service.mesSoumissions(req.user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Post(':id/submit')
  @Roles(Role.APPRENANT)
  @UseInterceptors(FileInterceptor('file'))
  submit(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.service.submit(id, file, req.user);
  }

  @Put(':id/noter/:apprenantId')
  @Roles(Role.FORMATEUR, Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT)
  noter(
    @Param('id') id: string,
    @Param('apprenantId') apprenantId: string,
    @Body() body: { note: number; commentaire?: string },
    @Req() req: any,
  ) {
    return this.service.noter(id, apprenantId, body.note, body.commentaire ?? '', req.user);
  }
}
