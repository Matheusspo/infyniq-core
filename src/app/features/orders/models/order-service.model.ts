// src/app/features/orders/models/order-service.model.ts

export type OSStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OSType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'INSTALLATION';

/**
 * Interface para representar as peças reservadas/utilizadas na O.S.
 * Essencial para o controle do Almoxarifado do Henrique.
 */
export interface OrderServicePart {
  id: string;
  name: string;
  requestedQuantity: number;
  currentQuantity?: number; // Para exibição de saldo no momento da seleção
}

export interface OrderService {
  id: string;
  osNumber: string; // Ex: "OS-2024-001"

  // Relacionamentos (IDs)
  customerId: string;
  equipmentId: string;
  technicianId: string;

  // Cache para UI (Evita lookups constantes para renderizar cards)
  customerName: string; // Nome do Condomínio
  equipmentName: string; // Nome do Elevador
  technicianName: string; // Nome do Técnico

  // Dados do Serviço
  type: OSType;
  status: OSStatus;
  description: string;
  isEmergency: boolean; // Controla o alerta Amber do Henrique

  /** * ✨ Vínculo com Estoque
   * Lista de peças que serão reservadas ou baixadas
   */
  parts?: OrderServicePart[];

  // Auditoria (Conforme ARCHITECTURE.md)
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}
