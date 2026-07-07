import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vitalis Center EUP API')
    .setDescription('API REST — Système Multi-Tenant de Digitalisation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Vitalis Center API — http://localhost:${port}/api`);
  console.log(`Swagger — http://localhost:${port}/api/docs`);
}
bootstrap();
