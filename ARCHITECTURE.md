# 🏗️ Arquitetura Infyniq Service

Documentação da arquitetura e padrões de desenvolvimento do backend Infyniq Service.

---

## 📁 Estrutura de Pastas

```
src/
├── core/
│   ├── config/
│   │   ├── config.service.ts
│   │   └── index.ts
│   ├── database/
│   │   ├── json-db.service.ts       (persistência centralizada)
│   │   ├── factories/
│   │   │   ├── repository.factory.ts
│   │   │   └── index.ts
│   │   ├── repositories/            (abstratos)
│   │   │   ├── equipment-repository.abstract.ts
│   │   │   ├── service-order-repository.abstract.ts
│   │   │   └── index.ts
│   │   ├── database.module.ts
│   │   └── index.ts
│   ├── logging/
│   │   ├── logger.service.ts
│   │   └── index.ts
│   └── index.ts
├── modules/
│   ├── customers/
│   │   ├── customers.module.ts
│   │   ├── customers.controller.ts
│   │   ├── customers.service.ts
│   │   ├── dto/
│   │   │   ├── create-customer.dto.ts
│   │   │   ├── update-customer.dto.ts
│   │   │   └── index.ts
│   │   └── entities/
│   │       ├── customer.entity.ts
│   │       └── index.ts
│   ├── equipments/
│   │   ├── equipments.module.ts
│   │   ├── equipments.controller.ts
│   │   ├── service-order.controller.ts
│   │   ├── services/
│   │   │   ├── equipment.service.ts
│   │   │   └── service-order.service.ts
│   │   ├── repositories/
│   │   │   ├── in-memory-equipment.repository.ts
│   │   │   └── in-memory-service-order.repository.ts
│   │   ├── dto/
│   │   │   ├── create-equipment.dto.ts
│   │   │   ├── create-service-order.dto.ts
│   │   │   └── index.ts
│   │   └── entities/
│   │       ├── equipment.entity.ts
│   │       ├── service-order.entity.ts
│   │       └── index.ts
│   └── stock/
│       ├── stock.module.ts
│       ├── stock.controller.ts
│       ├── stock.service.ts
│       ├── repositories/
│       │   ├── in-memory-stock.repository.ts
│       │   ├── stock-repository.abstract.ts
│       │   └── index.ts
│       ├── dto/
│       │   ├── create-stock-item.dto.ts
│       │   ├── create-movement.dto.ts
│       │   ├── update-stock-item.dto.ts
│       │   └── index.ts
│       └── entities/
│           ├── stock-item.entity.ts
│           ├── stock-movement.entity.ts
│           └── index.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── main.ts
```

---

## 🎯 Padrões por Camada

### 1. **Padrão de Pastas por Módulo**

Cada módulo segue a estrutura:

```
modules/[nome-do-modulo]/
├── [nome].module.ts           (NestJS Module declaration)
├── [nome].controller.ts        (HTTP endpoints)
├── [nome].service.ts           (Business logic)
├── entities/
│   └── [nome].entity.ts        (Domain models)
├── dto/
│   ├── create-[nome].dto.ts    (Create validation)
│   ├── update-[nome].dto.ts    (Update validation)
│   └── index.ts
└── repositories/               (If using persistence)
    └── [implementation].repository.ts
```

**Convenções de Nomenclatura:**

- Pastas: `kebab-case`
- Arquivos: `kebab-case.ts`
- Classes/Interfaces: `PascalCase`
- Propriedades/Métodos: `camelCase`

---

### 2. **DTOs - Validação com Class Validator**

DTOs são responsáveis por validar dados de entrada. Sempre use decoradores do `class-validator`.

```typescript
import {
  IsString,
  IsEmail,
  IsUUID,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  name: string;

  @IsString()
  document: string;

  @IsString()
  address: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
```

---

### 3. **Entities - Modelos de Domínio**

Entities representam os dados do seu domínio. Use `interfaces` ou `classes`.

```typescript
export interface Customer {
  id: string;
  name: string;
  document: string;
  address: string;
  email: string;
  phone?: string;
  isActive: boolean;

  // Auditoria
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

// Ou com classe:
export class Customer {
  id: string;
  name: string;
  document: string;
  address: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}
```

---

### 4. **Services - Lógica de Negócio**

Services contêm toda a lógica de negócio. Recebem dados validados via DTOs.

```typescript
import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { LoggerService } from '../../../core/logging/logger.service';
import { CustomerRepository } from '../repositories/your-repo';

@Injectable()
export class CustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    // Validar regras de negócio
    this.logger.log('Criando novo cliente: ' + dto.email);

    const customer = await this.customerRepository.create(dto);

    this.logger.log('Cliente criado com sucesso: ' + customer.id);
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return customer;
  }

  async update(
    id: string,
    dto: UpdateCustomerDto,
    updatedBy: string = 'system',
  ): Promise<Customer> {
    this.logger.log(`Atualizando cliente ${id} por ${updatedBy}`);
    return this.customerRepository.update(id, dto, updatedBy);
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
    this.logger.log(`Cliente deletado: ${id}`);
  }
}
```

---

### 5. **Controllers - Endpoints REST**

Controllers expõem os endpoints HTTP e delegam lógica para Services.

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
} from '@nestjs/common';
import { CustomerService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto, 'system');
  }

  @Delete(':id')
  @HttpCode(204)
  delete(@Param('id') id: string) {
    return this.customerService.delete(id);
  }
}
```

---

### 6. **Repositories - Persistência**

Repositories encapsulam acesso aos dados. Use `JsonDbService` para persistência.

```typescript
import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../../../core/database/json-db.service';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InMemoryCustomerRepository {
  private customers: Customer[] = [];
  private readonly fileName = 'customers.json';

  constructor(private jsonDbService: JsonDbService) {
    this.loadFromFile();
  }

  private async loadFromFile(): Promise<void> {
    try {
      this.customers = await this.jsonDbService.readFile(this.fileName, []);
    } catch (error) {
      this.customers = [];
    }
  }

  private async saveToFile(): Promise<void> {
    await this.jsonDbService.writeFile(this.fileName, this.customers);
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    const customer: Customer = {
      id: uuid(),
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.push(customer);
    await this.saveToFile();
    return customer;
  }

  async findAll(): Promise<Customer[]> {
    return this.customers.filter((c) => c.isActive);
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customers.find((c) => c.id === id && c.isActive) || null;
  }

  async update(
    id: string,
    data: Partial<Customer>,
    updatedBy: string = 'system',
  ): Promise<Customer> {
    const index = this.customers.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Cliente não encontrado');
    }

    this.customers[index] = {
      ...this.customers[index],
      ...data,
      updatedAt: new Date(),
      updatedBy,
    };

    await this.saveToFile();
    return this.customers[index];
  }

  async delete(id: string): Promise<void> {
    this.customers = this.customers.filter((c) => c.id !== id);
    await this.saveToFile();
  }
}
```

---

### 7. **Modules - Declaração NestJS**

Modules agregam Controllers, Services e Providers.

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { InMemoryCustomerRepository } from './repositories/in-memory-customer.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomersController],
  providers: [CustomersService, InMemoryCustomerRepository],
  exports: [CustomersService],
})
export class CustomersModule {}
```

---

## 🔐 Regras Obrigatórias

### Persistência

- ✅ Use `JsonDbService` para arquivo
- ✅ Nunca use `fs` diretamente fora de `JsonDbService`
- ✅ Sempre salve com `updatedBy`

### Logging

- ✅ Use `LoggerService` em Services e Repositories
- ❌ Nunca use `console.log()`

### Validação

- ✅ DTOs com `class-validator` decoradores
- ✅ Valide no Controller (via DTO) e no Service (regras de negócio)
- ✅ Mensagens de erro claras

### Auditoria

- ✅ Adicione `createdAt`, `updatedAt`, `updatedBy` em todas as entities
- ✅ Atualize `updatedAt` em todo update
- ✅ Registre `updatedBy` para rastreamento

### Nomenclatura de Endpoints

```
POST   /[feature]           → create
GET    /[feature]           → findAll
GET    /[feature]/:id       → findOne
PATCH  /[feature]/:id       → update / partially update
DELETE /[feature]/:id       → delete
```

---

## 📦 Stack Tecnológico

- **Runtime:** Node.js
- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Validação:** class-validator, class-transformer
- **Logging:** Logger nativo do NestJS
- **Persistência:** JSON files (JsonDbService)
- **ID Generation:** uuid v4

---

## 🚀 Como Usar Esta Arquitetura

1. **Para criar um novo módulo:**
   - Copie a estrutura de pastas de um módulo existente
   - Adapte Entity, DTOs e Service
   - Mantenha a mesma convenção de nomes

2. **Para adicionar um novo endpoint:**
   - Crie um método no Service
   - Crie um método no Controller
   - Valide input via DTO

3. **Para modificar entidades:**
   - Adicione campo na Entity
   - Crie/atualize DTOs
   - Atualize persistência (Repository)
   - Atualize business logic (Service)

4. **Para depuração:**
   - Use `LoggerService` em todos os pontos críticos
   - Inputs/outputs de métodos importantes
   - Errors e exceptions

---

**Versão:** 1.0  
**Última atualização:** 16/02/2026  
**Mantido por:** Equipe Infyniq

```

```
