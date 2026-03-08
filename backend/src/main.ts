import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // 🛠️ CONFIGURACIÓN DE CORS DINÁMICA
  const frontendUrl = process.env.FRONTEND_URL;

  app.enableCors({
    origin: [
      frontendUrl, // URL de producción desde variables de entorno
    ].filter(Boolean) as string[], // Filtramos por si frontendUrl llega undefined
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'static/uploads'), {
    prefix: '/uploads/',
  });

  // Escucha en 0.0.0.0 para Render
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}/api`);
}
void bootstrap();
