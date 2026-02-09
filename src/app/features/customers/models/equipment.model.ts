export interface Equipment {
  id: string;
  customerId: string; // Relacionamento com o Condomínio

  // Identificação Visual e Localização
  name: string; // Ex: "Elevador Social 01", "Torre A - Carga"
  position?: string; // Localização física dentro do prédio

  // Dados do Fabricante (Vital para peças de reposição)
  brand: string; // Ex: Otis, Atlas Schindler, Thyssenkrupp, Kone
  model: string; // Ex: Gen2, 3300, Sinergy
  serialNumber: string; // Número de série da placa/máquina
  manufactureYear?: number;

  // Especificações Técnicas (O Prontuário)
  technicalSpecs: {
    stops: number; // Quantidade de paradas/andares
    capacityKg: number; // Capacidade em KG
    capacityPersons: number; // Capacidade em pessoas
    speed?: number; // Velocidade em m/s
    driveType: 'GEARED' | 'GEARLESS' | 'HYDRAULIC'; // Tipo de tração
    controlPanel?: string; // Modelo do quadro de comando (Ex: Infolev, VVVF)
  };

  // Histórico e Status
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  lastPreventiveDate?: Date;
  nextPreventiveDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/** * DTO para criação via formulário
 * (omitimos campos gerados pelo backend)
 */
export type CreateEquipmentDto = Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>;
