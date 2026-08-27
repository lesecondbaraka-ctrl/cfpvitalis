import {
  Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, ParseUUIDPipe, UseInterceptors, UploadedFile, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EtablissementGuard } from '../../common/guards/etablissement.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CandidatureService } from './candidature.service';
import { CreateCandidatureDto, DecisionCandidatureDto } from './dto/admission.dto';
import { uploadFileFilter, MAX_UPLOAD_FILE_SIZE } from '../../common/utils/file-upload.util';
import { type_piece_candidature } from '@prisma/client';

@Controller('candidatures')
@UseGuards(JwtAuthGuard, EtablissementGuard, RolesGuard)
export class CandidatureController {
  constructor(private service: CandidatureService) {}

  @Post()
  @Roles(Role.APPRENANT)
  create(@Body() dto: CreateCandidatureDto, @Req() req: any) {
    return this.service.createDraft(dto, req.user);
  }

  @Get()
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  findAll(
    @Query('sessionId') sessionId?: string,
    @Query('etablissementId') etablissementId?: string,
    @Query('statut') statut?: any,
    @Query('search') search?: string,
    @Req() req?: any,
  ) {
    return this.service.listAll(req.user, { sessionId, etablissementId, statut, search });
  }

  @Get('mes-voeux')
  @Roles(Role.APPRENANT)
  mesVoeux(@Req() req: any) {
    return this.service.listMine(req.user);
  }

  @Post('jobs/expirer')
  @Roles(Role.ADMIN_CENTRE)
  expirer() {
    return this.service.processExpirations();
  }

  @Post('jobs/inscrire')
  @Roles(Role.ADMIN_CENTRE)
  inscrire() {
    return this.service.processInscriptions();
  }

  @Get('session/:sessionId')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  bySession(@Param('sessionId', ParseUUIDPipe) sessionId: string, @Req() req: any) {
    return this.service.listBySession(sessionId, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.findOne(id, req.user);
  }

  @Post(':id/soumettre')
  @Roles(Role.APPRENANT)
  soumettre(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.submit(id, req.user);
  }

  @Post(':id/confirmer')
  @Roles(Role.APPRENANT)
  confirmer(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.confirm(id, req.user);
  }

  @Post(':id/retirer')
  @Roles(Role.APPRENANT)
  retirer(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.withdraw(id, req.user);
  }

  @Post(':id/evaluer')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  evaluer(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.ouvrirEvaluation(id, req.user);
  }

  @Post(':id/decision')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  decision(@Param('id', ParseUUIDPipe) id: string, @Body() dto: DecisionCandidatureDto, @Req() req: any) {
    return this.service.decide(id, dto, req.user);
  }

  @Post(':id/promouvoir')
  @Roles(Role.ADMIN_CENTRE, Role.ADMIN_ETABLISSEMENT, Role.PERSONNEL_ADMINISTRATIF)
  promouvoir(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.service.promouvoir(id, req.user);
  }

  @Post(':id/pieces')
  @Roles(Role.APPRENANT)
  @UseInterceptors(FileInterceptor('file', { fileFilter: uploadFileFilter, limits: { fileSize: MAX_UPLOAD_FILE_SIZE } }))
  uploadPiece(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('type') type: type_piece_candidature,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.service.uploadPiece(id, type || type_piece_candidature.AUTRE, file, req.user);
  }

  @Delete(':id/pieces/:pieceId')
  @Roles(Role.APPRENANT)
  deletePiece(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('pieceId', ParseUUIDPipe) pieceId: string,
    @Req() req: any,
  ) {
    return this.service.deletePiece(id, pieceId, req.user);
  }
}
