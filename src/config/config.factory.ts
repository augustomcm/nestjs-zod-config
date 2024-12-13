import { configSchema } from './config.schema';
import { Config } from './config.type';
import { ConfigException } from './config.exception';

export function configFactory(): Config {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    },
  });

  if (!result.success) {
    throw new ConfigException(
      `Configuration file error: ${result.error.message}`,
    );
  }

  return result.data;
}
