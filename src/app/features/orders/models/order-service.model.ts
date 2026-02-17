// src/app/features/orders/models/order-service.model.ts

export type OSStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type OSType = 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY' | 'INSTALLATION';

export interface OrderService {
  id: string;
  osNumber: string; // Ex: "OS-2024-001"
  customerId: string;
  customerName: string; // Nome do Condomínio para o Card
  equipmentId: string;
  equipmentName: string; // Nome do Elevador para o Card
  technicianId: string;
  technicianName: string; // Nome do Técnico para o Card
  type: OSType;
  status: OSStatus;
  description: string;
  isEmergency: boolean; // Controla o alerta Amber do Henrique

  // Auditoria (Padrão ARCHITECTURE.md)
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}
