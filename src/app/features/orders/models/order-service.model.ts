export type OSStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_PARTS' | 'COMPLETED' | 'CANCELLED';
export type OSType = 'PREVENTIVE' | 'CORRECTIVE' | 'INSTALLATION' | 'EMERGENCY';

export interface OrderService {
  id: string;
  osNumber: string; // Ex: OS-2024-001
  customerId: string;
  customerName: string;
  equipmentId: string;
  equipmentName: string;
  type: OSType;
  status: OSStatus;
  description: string;
  technicianId: string;
  technicianName: string;
  createdAt: Date;
  scheduledFor?: Date;
  completedAt?: Date;
}
