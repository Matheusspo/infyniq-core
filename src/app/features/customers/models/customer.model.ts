import { Equipment } from './equipment.model';

export interface Customer {
  id: string;
  name: string; // Nome do Condomínio / Empresa
  document: string; // CNPJ
  address: string;
  contactName: string; // Síndico ou Gestor
  phone: string;
  email: string;
  active: boolean;
  createdAt: Date;
  equipments?: Equipment[];
  lat?: number;
  lng?: number;
}
