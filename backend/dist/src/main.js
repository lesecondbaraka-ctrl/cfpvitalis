"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:4200'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Vitalis Center EUP API')
        .setDescription('API REST — Système Multi-Tenant de Digitalisation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Vitalis Center API — http://localhost:${port}/api`);
    console.log(`Swagger — http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map