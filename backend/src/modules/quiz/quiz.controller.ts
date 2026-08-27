import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { QuizService } from './quiz.service';
import { CreateQuizDto, SubmitQuizDto, UpdateQuizDto } from './dto/quiz.dto';

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
  create(@Param('moduleId', ParseUUIDPipe) moduleId: string, @Body() dto: CreateQuizDto, @Req() req: any) {
    return this.service.create(moduleId, dto, req.user);
  }

  @Get('module/:moduleId')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT)
  findByModule(@Param('moduleId', ParseUUIDPipe) moduleId: string, @Req() req: any) {
    return this.service.findByModule(moduleId, req.user);
  }

  @Get(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR, Role.APPRENANT)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const forApprenant = req.user.role === Role.APPRENANT;
    return this.service.findOne(id, req.user, forApprenant);
  }

  @Post(':id/submit')
  @Roles(Role.APPRENANT)
  submit(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SubmitQuizDto, @Req() req: any) {
    return this.service.submit(id, dto.reponses, req.user);
  }

  @Put(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateQuizDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.FORMATEUR)
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.delete(id, req.user);
  }
}
