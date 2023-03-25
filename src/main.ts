import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initSwagger } from './configs/swagger.config';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.modules';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService: ApiConfigService = app
    .select(SharedModule)
    .get(ApiConfigService);

  const port = configService.getEnv('PORT');
  const appName = configService.getEnv('APP_NAME');

  app.setGlobalPrefix(`api`);
  app.enableCors();
  app.enableShutdownHooks();

  initSwagger(app, appName);

  await app.listen(port, () => {
    console.info(`start server at ${port}`);
  });
}
bootstrap();
