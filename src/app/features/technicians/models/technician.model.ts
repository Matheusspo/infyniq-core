export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string; // ex: 'Mecânica', 'Elétrica', 'Eletrônica'
  isActive: boolean;
}
