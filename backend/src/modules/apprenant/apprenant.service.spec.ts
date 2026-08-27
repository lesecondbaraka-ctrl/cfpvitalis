import { Test, TestingModule } from '@nestjs/testing';
import { ApprenantService } from './apprenant.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { PedagogieService } from '../pedagogie/pedagogie.service';
import { CertificationService } from '../certification/certification.service';
import { Role } from '../../common/enums/role.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ApprenantService (Performance & BR-03)', () => {
  let service: ApprenantService;
  let prisma: PrismaService;
  let pedagogieService: PedagogieService;

  const mockPrisma = {
    formation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    soumissionDevoir: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    seanceFormation: {
      findFirst: jest.fn(),
    },
    tentativeQuiz: {
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    certificat: {
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    userProgress: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    devoir: {
      findFirst: jest.fn(),
    },
    apprenant: {
      findUnique: jest.fn(),
    },
    inscription: {
      findMany: jest.fn(),
    },
    cours: {
      findUnique: jest.fn(),
    },
    quiz: {
      findUnique: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  const mockPedagogieService = {
    getProgressByFormation: jest.fn(),
    getMoyennePonderee: jest.fn(),
  };

  const mockCertificationService = {
    genererCertificat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprenantService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: StorageService, useValue: mockStorageService },
        { provide: PedagogieService, useValue: mockPedagogieService },
        { provide: CertificationService, useValue: mockCertificationService },
      ],
    }).compile();

    service = module.get<ApprenantService>(ApprenantService);
    prisma = module.get<PrismaService>(PrismaService);
    pedagogieService = module.get<PedagogieService>(PedagogieService);
    service.invalidateUserCache('u-apprenant-1');
  });

  afterEach(() => {
    service.invalidateUserCache('u-apprenant-1');
    jest.clearAllMocks();
  });

  describe('assertApprenant', () => {
    it('should throw ForbiddenException if user is not APPRENANT', async () => {
      const nonApprenant = { id: 'u-1', role: Role.FORMATEUR, etablissementId: 'e-1' };
      await expect(service.getDashboard(nonApprenant)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDashboard (Optimized Single Batch Query)', () => {
    it('should compute aggregated metrics and in-memory progress correctly', async () => {
      const user = { id: 'u-apprenant-1', role: Role.APPRENANT, etablissementId: 'e-1' };

      mockPrisma.formation.findMany.mockResolvedValue([
        {
          id: 'f-1',
          titre: 'Développement Web',
          description: 'Formation Web',
          modules: [
            {
              id: 'm-1',
              cours: [{ id: 'c-1' }, { id: 'c-2' }],
            },
          ],
          certificats: [],
        },
      ]);
      mockPrisma.soumissionDevoir.findMany.mockResolvedValue([]);
      mockPrisma.seanceFormation.findFirst.mockResolvedValue(null);
      mockPrisma.tentativeQuiz.count.mockResolvedValue(3);
      mockPrisma.certificat.count.mockResolvedValue(0);
      mockPrisma.userProgress.findMany.mockResolvedValue([{ coursId: 'c-1' }]);
      mockPrisma.devoir.findFirst.mockResolvedValue(null);

      const dashboard = await service.getDashboard(user);

      expect(dashboard.completionGlobale).toBe(50); // 1 cours complété sur 2 = 50%
      expect(dashboard.nbFormations).toBe(1);
      expect(dashboard.nbQuizPasses).toBe(3);
      expect(dashboard.formationsActives[0].pourcentage).toBe(50);
      expect(dashboard.formationsActives[0].coursCompletes).toBe(1);
      expect(dashboard.formationsActives[0].totalCours).toBe(2);
    });
  });

  describe('checkEligibiliteCertificat (BR-03)', () => {
    it('should reject eligibility if courses are not 100% completed', async () => {
      const user = { id: 'u-apprenant-1', role: Role.APPRENANT, etablissementId: 'e-1' };
      mockPrisma.formation.findUnique.mockResolvedValue({ id: 'f-1', etablissementId: 'e-1' });
      mockPrisma.certificat.findFirst.mockResolvedValue(null);
      mockPedagogieService.getProgressByFormation.mockResolvedValue({ completionRate: 80 });
      mockPedagogieService.getMoyennePonderee.mockResolvedValue(14);

      const result = await service.checkEligibiliteCertificat('f-1', user);

      expect(result.eligible).toBe(false);
      expect(result.raison).toContain('incomplète');
    });

    it('should reject eligibility if weighted average is < 10/20', async () => {
      const user = { id: 'u-apprenant-1', role: Role.APPRENANT, etablissementId: 'e-1' };
      mockPrisma.formation.findUnique.mockResolvedValue({ id: 'f-1', etablissementId: 'e-1' });
      mockPrisma.certificat.findFirst.mockResolvedValue(null);
      mockPedagogieService.getProgressByFormation.mockResolvedValue({ completionRate: 100 });
      mockPedagogieService.getMoyennePonderee.mockResolvedValue(9.5);

      const result = await service.checkEligibiliteCertificat('f-1', user);

      expect(result.eligible).toBe(false);
      expect(result.raison).toContain('insuffisante');
    });

    it('should grant eligibility when 100% completed and average >= 10/20', async () => {
      const user = { id: 'u-apprenant-1', role: Role.APPRENANT, etablissementId: 'e-1' };
      mockPrisma.formation.findUnique.mockResolvedValue({ id: 'f-1', etablissementId: 'e-1' });
      mockPrisma.certificat.findFirst.mockResolvedValue(null);
      mockPedagogieService.getProgressByFormation.mockResolvedValue({ completionRate: 100 });
      mockPedagogieService.getMoyennePonderee.mockResolvedValue(15.5);

      const result = await service.checkEligibiliteCertificat('f-1', user);

      expect(result.eligible).toBe(true);
      expect(result.raison).toBeNull();
    });
  });
});
