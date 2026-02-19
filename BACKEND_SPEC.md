# 📋 Backend Specification - Infyniq Service

Interfaces e tipos TypeScript do backend para uso no frontend.

---

## 🔗 Como Usar Este Arquivo

Copie as interfaces necessárias para seu projeto frontend e use como base para:

- Type-safe API calls
- Form validation
- Data modeling
- State management

---

## 👥 CUSTOMERS Module

### DTOs (Input)

```typescript
export interface CreateCustomerDto {
  name: string; // @MinLength(3) - Nome do Condomínio
  document: string; // CNPJ
  address: string; // Endereço completo
  email: string; // @IsEmail
  contactName?: string; // Síndico/Gestor
  phone?: string; // Contato
}

export interface UpdateCustomerDto {
  name?: string; // @MinLength(3)
  email?: string; // @IsEmail
  address?: string;
  contactName?: string;
  phone?: string;
}
```

### Entities (Output)

```typescript
export interface Customer extends CreateCustomerDto {
  id: string; // UUID
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string; // 'system' ou ID do usuário
  equipments?: Equipment[]; // Elevadores associados (opcional)
}
```

### Endpoints

```
POST   /customers                 → Criar cliente
GET    /customers                 → Listar todos
GET    /customers/:id             → Buscar por ID
PATCH  /customers/:id             → Atualizar
DELETE /customers/:id             → Deletar
```

---

## 🛗 EQUIPMENTS Module

### Enums

```typescript
export enum EquipmentStatus {
  OPERATIONAL = 'OPERATIONAL', // Em operação
  MAINTENANCE = 'MAINTENANCE', // Em manutenção
  OUT_OF_SERVICE = 'OUT_OF_SERVICE', // Fora de serviço
}

export enum DriveType {
  GEARED = 'GEARED',
  GEARLESS = 'GEARLESS',
  HYDRAULIC = 'HYDRAULIC',
}
```

### DTOs (Input)

```typescript
export interface TechnicalSpecsDto {
  stops: number; // Número de paradas
  capacityKg: number; // Capacidade em kg
  capacityPersons: number; // Capacidade em pessoas
  speed?: number; // Velocidade em m/s (opcional)
  manufactureyear?: number; // Ano de fabricação (1900-atual)
  driveType: 'GEARED' | 'GEARLESS' | 'HYDRAULIC';
  controlPanel?: string; // Tipo de painel
}

export interface CreateEquipmentDto {
  customerId: string; // @IsUUID - Cliente proprietário
  name: string; // Nome do elevador
  brand: string; // @IsString - OBRIGATÓRIO
  model: string; // @IsString - OBRIGATÓRIO
  serialNumber?: string;
  position?: string; // Localização (ex: "Bloco A - Acesso Geral")
  technicalSpecs: TechnicalSpecsDto;
  status?: EquipmentStatus;
  lastPreventiveDate?: Date;
  nextPreventiveDate?: Date;
}

export interface UpdateEquipmentDto {
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  position?: string;
  status?: EquipmentStatus;
  technicalSpecs?: Partial<TechnicalSpecsDto>;
  lastPreventiveDate?: Date;
  nextPreventiveDate?: Date;
}
```

### Entities (Output)

```typescript
export interface Equipment extends CreateEquipmentDto {
  id: string; // UUID
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string; // Auditoria
}

export interface ServiceOrder {
  id: string; // UUID
  equipmentId: string;
  customerId: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  startDate: Date;
  endDate?: Date;
  assignedTo?: string; // ID do técnico
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}
```

### Endpoints

```
POST   /equipments                    → Criar equipamento
GET    /equipments                    → Listar todos
GET    /equipments/:id                → Buscar por ID
GET    /customers/:customerId/equipments → Listar por cliente
PATCH  /equipments/:id                → Atualizar
DELETE /equipments/:id                → Deletar

POST   /serviceorders                 → Criar OS
GET    /serviceorders                 → Listar todas
GET    /serviceorders/:id             → Buscar por ID
GET    /equipments/:equipmentId/serviceorders → Listar por equipamento
PATCH  /serviceorders/:id             → Atualizar
DELETE /serviceorders/:id             → Cancelar
```

---

## 📦 STOCK Module

### Enums

```typescript
export enum ABCCategory {
  A = 'A', // 80% do valor/importância (Poucos itens)
  B = 'B', // 15% do valor/importância
  C = 'C', // 5% do valor/importância (Muitos itens)
}

export enum MovementType {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
  AJUSTE = 'ajuste',
  TRANSFERENCIA = 'transferencia',
}
```

### DTOs (Input)

```typescript
export interface CreateStockItemDto {
  code: string; // Código único (SKU)
  name: string; // Nome do item
  description?: string;
  category: ABCCategory; // Classificação ABC
  currentQuantity: number;
  reservedQuantity: number;
  minQuantity: number; // Quantidade mínima
  unit: string; // Unidade (pç, m, kg, etc)
  supplier?: string; // Fornecedor
  costPrice: number; // Preço de custo
  location?: string; // Localização no estoque
  isCritical: boolean; // Dispara alerta se atingir mínimo
  leadTimeDays: number; // Dias para entrega do fornecedor
  imageUrl?: string;
}

export interface UpdateStockItemDto {
  name?: string;
  description?: string;
  category?: ABCCategory;
  currentQuantity?: number;
  reservedQuantity?: number;
  minQuantity?: number;
  unit?: string;
  supplier?: string;
  costPrice?: number;
  location?: string;
  isCritical?: boolean;
  leadTimeDays?: number;
  imageUrl?: string;
}

export interface CreateMovementDto {
  stockItemId: string; // ID do item
  type: MovementType;
  quantity: number;
  reason: string; // Motivo do movimento
  reference?: string; // Referência (número de OS, NF, etc)
  technicianId?: string; // Quem fez o movimento
  cost?: number; // Custo unitário
}
```

### Entities (Output)

```typescript
export interface StockItem extends CreateStockItemDto {
  id: string; // UUID
  availableQuantity: number; // currentQuantity - reservedQuantity
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
  isActive: boolean;
}

export interface StockMovement {
  id: string; // UUID
  stockItemId: string;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string;
  technicianId?: string;
  cost?: number;
  createdAt: Date;
  createdBy: string; // Quem criou o movimento
}
```

### Endpoints

```
POST   /stock                         → Criar item
GET    /stock                         → Listar todos
GET    /stock/:id                     → Buscar por ID
GET    /stock/code/:code              → Buscar por código
GET    /stock/location/:location      → Buscar por localização
PATCH  /stock/:id                     → Atualizar
DELETE /stock/:id                     → Deletar (marca como inativo)

POST   /stock/:itemId/movements       → Registrar movimento
GET    /stock/:itemId/movements       → Histórico de movimentos
GET    /stock/movements/range         → Movimentos por período
```

---

## 🔄 Padrão de Respostas HTTP

### Success (2xx)

```typescript
// GET /customers
{
  "data": Customer[],
  "meta": {
    "total": number,
    "page": number,
    "limit": number
  }
}

// POST /customers
{
  "data": Customer,
  "message": "Cliente criado com sucesso"
}

// PATCH /customers/:id
{
  "data": Customer,
  "message": "Cliente atualizado com sucesso"
}

// DELETE /customers/:id
{
  "message": "Cliente deletado com sucesso"
}
```

### Error (4xx/5xx)

```typescript
{
  "statusCode": number,
  "message": string | string[],
  "error": string
}

// Exemplo:
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "name must be longer than or equal to 3 characters",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

---

## ⚠️ Validações Importantes

### Customers

- ✅ `name`: string, min 3 caracteres
- ✅ `email`: valid email format
- ✅ `document`: string (CNPJ format recomendado)
- ✅ `address`: string, obrigatório

### Equipments

- ✅ `brand`: string, **OBRIGATÓRIO**
- ✅ `model`: string, **OBRIGATÓRIO**
- ✅ `customerId`: valid UUID
- ✅ `technicalSpecs.manufactureyear`: 1900 até ano atual
- ✅ `status`: enum válido

### Stock

- ✅ `code`: string único (sem duplicatas)
- ✅ `category`: enum válido (A, B, C)
- ✅ `currentQuantity`: number >= 0
- ✅ `minQuantity`: number > 0
- ✅ `costPrice`: number > 0

---

## 🔐 Autenticação & Autorização

Atualmente: **Sem autenticação** (todo endpoint é público)

Futuro:

- JWT ou Bearer tokens
- Role-based access control (RBAC)
- Soft deletes ao invés de hard deletes

---

## 📚 Referências Rápidas

### Criar um Cliente

```typescript
const newCustomer = await fetch('/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Condomínio Exemplo',
    document: '12.345.678/0001-90',
    address: 'Rua A, 100',
    email: 'sindico@example.com',
  } as CreateCustomerDto),
});
```

### Criar um Equipamento

```typescript
const newEquipment = await fetch('/equipments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: 'customer-id-here',
    name: 'Elevador Social',
    brand: 'OTIS', // Obrigatório
    model: 'Gen2', // Obrigatório
    position: 'Bloco A - Acesso Geral',
    technicalSpecs: {
      stops: 5,
      capacityKg: 1000,
      capacityPersons: 13,
      manufactureyear: 2020,
      driveType: 'GEARLESS',
    },
  } as CreateEquipmentDto),
});
```

### Registrar Movimento de Stock

```typescript
const movement = await fetch('/stock/item-id/movements', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'SAIDA',
    quantity: 2,
    reason: 'Uso em OS #001',
    reference: 'OS-001',
    technicianId: 'tech-123',
  } as CreateMovementDto),
});
```

---

**Versão:** 1.0  
**Última atualização:** 16/02/2026  
**Mantido por:** Equipe Infyniq
