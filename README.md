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

#### Esquema de Validação

Utilize Zod para definir o esquema das variáveis de ambiente:

```typescript
import { z } from 'zod';

export const configSchema = z.object({
  env: z.enum(['development', 'production']),
  port: z.coerce.number().positive().int(),
  database: z.object({
    host: z.string().min(1),
    database: z.string().min(1),
    username: z.string().min(1),
    password: z.string().min(1),
    port: z.coerce.number().positive().int(),
  }),
});
```

#### Exceção Personalizada

Para capturar erros:

```typescript
export class ConfigException extends Error {}
```

#### Fábrica de Configuração

Valide e carregue as configurações:

```typescript
import { configSchema } from './config.schema';
import { ConfigException } from './config.exception';

export function configFactory() {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    throw new ConfigException(`Erro na configuração: ${result.error.message}`);
  }

  return result.data;
}
```

#### Integração no Módulo

Adicione o módulo ao projeto:

```typescript
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { configFactory } from './config.factory';

@Module({
  imports: [NestConfigModule.forRoot({ load: [configFactory] })],
  exports: [NestConfigModule],
})
export class ConfigModule {}
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

