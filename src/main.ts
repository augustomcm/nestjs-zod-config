import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  Logger.debug(configService.get('env'), 'environment');
  Logger.debug(configService.get('port'), 'port');
  Logger.debug(configService.get('database'), 'database');

  await app.listen(configService.get('port'));
}

bootstrap();
