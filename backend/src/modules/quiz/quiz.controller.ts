import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { QuizService } from './quiz.service';

@Controller('quiz')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
export class QuizController {
  constructor(private service: QuizService) {}

  @Get('mes/tentatives')
  @Roles(Role.APPRENANT)
  mesTentatives(@Req() req: any) {
    return this.service.getMesTentatives(req.user.id);
  }

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

  @Get(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT)
  findOne(@Param('id') id: string, @Req() req: any) {
    const forApprenant = req.user.role === Role.APPRENANT;
    return this.service.findOne(id, req.user, forApprenant);
  }

  @Post(':id/submit')
  @Roles(Role.APPRENANT)
  submit(@Param('id') id: string, @Body() body: { reponses: { questionId: string; selectedIndex: number }[] }, @Req() req: any) {
    return this.service.submit(id, body.reponses, req.user);
  }
}
