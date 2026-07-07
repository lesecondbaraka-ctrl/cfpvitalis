import {
  Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PedagogieService } from './pedagogie.service';
import { StorageService } from '../../common/services/storage.service';

@Controller('pedagogie')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
export class PedagogieController {
  constructor(
    private service: PedagogieService,
    private storage: StorageService,
  ) {}

  @Get('formations')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT, Role.PERSONNEL_ADMINISTRATIF)
  getFormations(@Req() req: any) {
    return this.service.getFormations(req.user);
  }

  @Get('formations/:id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT, Role.PERSONNEL_ADMINISTRATIF)
  getFormation(@Param('id') id: string, @Req() req: any) {
    return this.service.getFormation(id, req.user);
  }

  @Post('formations')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  createFormation(@Body() data: { titre: string; description: string }, @Req() req: any) {
    return this.service.createFormation(data, req.user);
  }

  @Put('formations/:id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  updateFormation(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.service.updateFormation(id, data, req.user);
  }

  @Delete('formations/:id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  deleteFormation(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteFormation(id, req.user);
  }

  @Post('formations/:formationId/modules')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  createModule(
    @Param('formationId') formationId: string,
    @Body() data: { titre: string; coefficient?: number; ordre?: number },
    @Req() req: any,
  ) {
    return this.service.createModule(formationId, data, req.user);
  }

  @Post('modules/:moduleId/cours')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  createCours(
    @Param('moduleId') moduleId: string,
    @Body() data: { titre: string; contenu?: string; fileUrl?: string },
    @Req() req: any,
  ) {
    return this.service.createCours(moduleId, data, req.user);
  }

  @Get('cours/:id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT)
  getCours(@Param('id') id: string, @Req() req: any) {
    if (req.user.role === Role.APPRENANT) {
      return this.service.getCoursWithProgress(id, req.user.id);
    }
    return this.service.getCours(id);
  }

  @Post('cours/:coursId/complete')
  @Roles(Role.APPRENANT)
  markComplete(@Param('coursId') coursId: string, @Req() req: any) {
    return this.service.markComplete(coursId, req.user.id);
  }

  @Post('cours/:coursId/upload')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCours(
    @Param('coursId') coursId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const url = await this.storage.uploadFile(file.buffer, file.originalname, file.mimetype, 'cours');
    return this.service.uploadCoursDocument(coursId, url, req.user);
  }

  @Get('formations/:formationId/progress')
  @Roles(Role.APPRENANT, Role.FORMATEUR, Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT)
  getProgress(@Param('formationId') formationId: string, @Req() req: any) {
    const userId = req.query.apprenantId || req.user.id;
    return this.service.getProgressByFormation(formationId, userId);
  }

  @Get('apprenants')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.PERSONNEL_ADMINISTRATIF)
  getApprenants(@Req() req: any) {
    return this.service.getApprenants(req.user);
  }

  @Post('modules/:moduleId/evaluations')
  @Roles(Role.FORMATEUR, Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT)
  createEvaluation(
    @Param('moduleId') moduleId: string,
    @Body() data: { titre: string; noteMaximale?: number },
    @Req() req: any,
  ) {
    return this.service.createEvaluation(moduleId, data, req.user);
  }

  @Get('modules/:moduleId/evaluations')
  @Roles(Role.FORMATEUR, Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT)
  getEvaluations(@Param('moduleId') moduleId: string, @Req() req: any) {
    return this.service.getEvaluationsByModule(moduleId, req.user);
  }

  @Post('evaluations/:evaluationId/notes')
  @Roles(Role.FORMATEUR, Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT)
  submitNote(
    @Param('evaluationId') evaluationId: string,
    @Body() data: { utilisateurId: string; valeur: number },
    @Req() req: any,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
    return this.service.submitNote(evaluationId, data.utilisateurId, data.valeur, req.user.id, ip);
  }
}
