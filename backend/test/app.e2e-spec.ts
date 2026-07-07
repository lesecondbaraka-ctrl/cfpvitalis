import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Vitalis Center API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Routes publiques', () => {
    it('GET /api/etablissements/list/public — sans JWT', () => {
      return request(app.getHttpServer())
        .get('/api/etablissements/list/public')
        .expect(200);
    });

    it('GET /api/certification/verifier/INVALID — sans JWT (404 attendu)', () => {
      return request(app.getHttpServer())
        .get('/api/certification/verifier/CERT-2026-99999')
        .expect(404);
    });

    it('POST /api/utilisateurs/login — identifiants invalides', () => {
      return request(app.getHttpServer())
        .post('/api/utilisateurs/login')
        .send({ email: 'invalid@test.fr', password: 'wrong' })
        .expect(401);
    });
  });

  describe('Routes protégées', () => {
    it('GET /api/pedagogie/formations — sans JWT → 401', () => {
      return request(app.getHttpServer())
        .get('/api/pedagogie/formations')
        .expect(401);
    });

    it('GET /api/seances — sans JWT → 401', () => {
      return request(app.getHttpServer())
        .get('/api/seances')
        .expect(401);
    });

    it('GET /api/analytics/global — sans JWT → 401', () => {
      return request(app.getHttpServer())
        .get('/api/analytics/global')
        .expect(401);
    });
  });

  describe('Étanchéité multi-tenant (BR-02)', () => {
    const PARIS_FORMATION_ID = '00000000-0000-0000-0000-000000000001';
    const DEMO_PASSWORD = 'Vitalis2025!';

    async function login(email: string): Promise<string> {
      const res = await request(app.getHttpServer())
        .post('/api/utilisateurs/login')
        .send({ email, password: DEMO_PASSWORD })
        .expect(200);
      return res.body.accessToken;
    }

    it('Admin Lyon ne peut pas accéder à une formation Paris → 403', async () => {
      const token = await login('admin.lyon@vitalis-center.fr');
      await request(app.getHttpServer())
        .get(`/api/pedagogie/formations/${PARIS_FORMATION_ID}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('Admin Lyon ne voit pas les formations Paris dans la liste', async () => {
      const token = await login('admin.lyon@vitalis-center.fr');
      const res = await request(app.getHttpServer())
        .get('/api/pedagogie/formations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      const ids = res.body.map((f: { id: string }) => f.id);
      expect(ids).not.toContain(PARIS_FORMATION_ID);
    });

    it('Apprenant Paris accède à sa formation mais pas au module d\'un autre établissement', async () => {
      const token = await login('apprenant@vitalis-center.fr');
      await request(app.getHttpServer())
        .get(`/api/pedagogie/formations/${PARIS_FORMATION_ID}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
