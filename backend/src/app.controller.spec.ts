import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return status ok', () => {
      const res = appController.getInfo();
      expect(res.status).toBe('ok');
      expect(res.service).toBe('Vitalis Center API');
    });

    it('should return health ok', () => {
      const res = appController.getHealth();
      expect(res.status).toBe('ok');
    });
  });
});
