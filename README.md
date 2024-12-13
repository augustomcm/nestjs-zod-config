# Como Validação com Zod Transformou Meu Processo de Desenvolvimento em NestJS

Trabalhar com configurações em projetos NestJS sempre foi um desafio. Desde pequenos detalhes, como variáveis de ambiente ausentes, até problemas maiores, como erros silenciosos que apenas aparecem em produção, o impacto de não ter um gerenciamento robusto é significativo. Este artigo explora como a utilização do Zod para validação de configurações não só resolveu esses problemas, mas também aprimorou a manutenção e a segurança dos projetos que desenvolvo.

---

## O Problema com Configurações Tradicionais

Em muitos projetos, as configurações são carregadas diretamente de variáveis de ambiente sem qualquer validação. Isso funciona em ambientes controlados, mas é arriscado. Durante meu trabalho em projetos maiores, encontrei problemas como:

- Valores ausentes que causavam falhas somente em tempo de execução.
- Configurações incorretas passando despercebidas.
- Depuração complicada devido à falta de mensagens claras de erro.

Foi quando percebi que era necessário centralizar e validar as configurações de forma programática.

---

## Como o Zod Resolve Esses Problemas

Zod é uma biblioteca de validação que permite criar esquemas robustos e reutilizáveis. O uso dessa ferramenta trouxe organização e clareza ao gerenciamento de configurações no NestJS. Com Zod, pude:

- Garantir que todas as variáveis fossem validadas antes do uso.
- Fornecer mensagens claras para erros de configuração.
- Reduzir significativamente os riscos associados a configurações incorretas.

---

## Passo a Passo da Implementação

### 1. Configurando o Ambiente

Certifique-se de ter o Node.js (versão 22) instalado para iniciar:

```bash
node -v
```

Crie um novo projeto NestJS:

```bash
npx @nestjs/cli new zod-config --strict
```

Adicione as dependências necessárias:

```bash
npm install zod @nestjs/config
```

### 2. Criando o Módulo de Configuração

#### Estruturando o Projeto

Crie uma nova pasta `config` dentro de `src` e organize o módulo de configuração nela:

```bash
mkdir src/config
```

#### Esquema de Validação

Utilize Zod para definir o esquema das variáveis de ambiente em `src/config/config.schema.ts`:

```typescript
import { z } from 'zod';

export const environmentSchema = z.enum(['development', 'production']);

export const databaseSchema = z.object({
  host: z.string().min(1),
  database: z.string().min(1),
  password: z.string().min(1),
  port: z.coerce.number().min(1),
  username: z.string().min(1),
});

export const configSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  database: databaseSchema,
});
```

#### Tipagem das Configurações

Defina os tipos inferidos do esquema em `src/config/config.type.ts`:

```typescript
import { z } from 'zod';
import { configSchema } from './config.schema';

export type Config = z.infer<typeof configSchema>;
```

#### Exceção Personalizada

Crie uma exceção personalizada em `src/config/config.exception.ts` para capturar erros:

```typescript
export class ConfigException extends Error {}
```

#### Fábrica de Configuração

Implemente a fábrica de configuração em `src/config/config.factory.ts` para validar e carregar as configurações:

```typescript
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
```

#### Serviço de Configuração

Crie um serviço para simplificar o acesso às configurações em `src/config/config.service.ts`:

```typescript
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
```

#### Integração no Módulo

Adicione o módulo ao projeto em `src/config/config.module.ts`:

```typescript
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { configFactory } from './config.factory';
import { ConfigService } from './config.service';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configFactory],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

### 3. Registrando no AppModule

Adicione o `ConfigModule` ao `AppModule` para garantir que ele seja carregado corretamente. No arquivo `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 4. Testando no Arquivo `main.ts`

Para garantir que a validação está funcionando, teste diretamente no arquivo `src/main.ts`. Primeiro, execute sem criar o arquivo `.env` e observe os erros no console. Em seguida, crie o arquivo `.env` com valores adequados e valide se o console exibe os valores corretamente.

#### Implementação do Teste

Adicione o seguinte código ao `src/main.ts`:

```typescript
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
```

Crie o arquivo `.env` na raiz do projeto com os seguintes valores de exemplo:

```
NODE_ENV=development
PORT=3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=postgres

```

Execute o projeto:

```bash
npm run start:dev
```

---

## Benefícios Observados

Depois de integrar o Zod no gerenciamento de configurações, os principais benefícios foram:

- **Robustez**: Nenhuma variável ausente ou incorreta passa despercebida.
- **Mensagens Claras**: Depurar erros ficou muito mais simples.
- **Confiabilidade**: A aplicação funciona conforme esperado em qualquer ambiente.

---

## Conclusão

Adotar o Zod para validação de configurações em projetos NestJS trouxe melhorias substanciais no meu fluxo de trabalho. Além de resolver problemas que antes consumiam tempo, essa abordagem me deu a confiança de que as configurações estão sempre corretas. Recomendo fortemente que você experimente e aproveite os benefícios dessa solução moderna.

---

## Referências

- [Documentação oficial do Zod](https://zod.dev/)
- [NestJS - Configurações de Ambiente](https://docs.nestjs.com/techniques/configuration)
