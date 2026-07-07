import { Test, TestingModule } from '@nestjs/testing';
import { UtilisateursService } from './utilisateurs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

describe('UtilisateursService (Business Rules)', () => {
  let service: UtilisateursService;
  let prisma: PrismaService;

  const mockPrisma = {
    etablissement: {
      findUnique: jest.fn(),
    },
    utilisateur: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UtilisateursService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<UtilisateursService>(UtilisateursService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ForbiddenException if establishment does not exist (BR-01)', async () => {
      mockPrisma.etablissement.findUnique.mockResolvedValue(null);

      const dto = {
        email: 'test@vitalis.com',
        password: 'password123',
        nom: 'Doe',
        prenom: 'John',
        role: Role.APPRENANT,
        etablissementId: 'uuid-etab-99',
      };

      await expect(service.register(dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
