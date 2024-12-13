import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config } from './config.type';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get<K extends keyof Config>(key: K): Config[K] {
    return this.configService.get(key, { infer: true }) as Config[K];
  }
}
