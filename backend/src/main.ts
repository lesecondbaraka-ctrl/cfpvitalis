import * as dotenv from 'dotenv';
import { join } from 'path';

// Charger l'environnement dès le démarrage
dotenv.config({ path: join(process.cwd(), '.env') });
dotenv.config({ path: join(process.cwd(), 'backend', '.env') });

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { swaggerProtect } from './common/middleware/swagger-protect.middleware';
import { AppModule } from './app.module';

// Polyfill pour sérialiser les BigInt en JSON sans erreur
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 2000,
      standardHeaders: true,
      legacyHeaders: false,
      message: 'Trop de requêtes. Réessayez dans quelques instants.',
    }),
  );

  app.setGlobalPrefix('api');

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server) or in whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Bloqué par la politique CORS Vitalis Center.'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Rate limiter strict pour l'authentification (Protection Brute-Force ANSSI)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // max 15 requêtes par fenêtre pour éviter le brute-force
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
  });
  app.use('/api/utilisateurs/login', authLimiter);
  app.use('/api/utilisateurs/register', authLimiter);
  app.use('/api/utilisateurs/enroler', authLimiter);

  // Rate limiter pour le formulaire de contact public
  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { statusCode: 429, message: 'Trop de messages envoyés. Réessayez plus tard.' },
  });
  app.use('/api/landing/contact', contactLimiter);

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false,
    setHeaders: (res, path, stat) => {
      const origin = (res.req as any)?.headers?.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
      } else {
        res.set('Access-Control-Allow-Origin', allowedOrigins[0] || 'http://localhost:4200');
      }
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Accept-Ranges', 'bytes');
    },
  });

  const swaggerEnabled = process.env.SWAGGER_ENABLED === 'true';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Vitalis Center EUP API')
      .setDescription('API REST — Système Multi-Tenant de Digitalisation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    // Optional protection for Swagger UI: require header `x-swagger-token` equal to SWAGGER_TOKEN
    try {
      app.use('/api/docs', swaggerProtect);
    } catch (e) {
      // fallback to dynamic import if needed in some environments
      app.use('/api/docs', (req, res, next) => swaggerProtect(req, res, next));
    }
    SwaggerModule.setup('api/docs', app, document);
    console.log(`Swagger — http://localhost:${process.env.PORT || 3000}/api/docs`);
  } else {
    console.log('Swagger est désactivé. Activez SWAGGER_ENABLED=true pour l’utiliser.');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Vitalis Center API — http://localhost:${port}/api`);
}
bootstrap();
