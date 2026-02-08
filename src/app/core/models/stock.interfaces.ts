export interface StockItem {
  id: string; // ID gerado pelo banco (NestJS/TypeORM/Prisma)
  code: string; // O que era SKU agora é code
  name: string;
  description?: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  unit: string; // Unidade de medida (un, mt, kg)
  costPrice: number; // O que era unitPrice agora é costPrice
  supplier?: string;
  location?: string;
  updatedAt: string; // ISO String vinda do JSON
}

export interface CreateStockItemDto {
  name: string;
  code: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  unit: string;
  costPrice: number;
  location?: string;
  description?: string;
}
