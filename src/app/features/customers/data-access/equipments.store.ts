// src/app/features/customers/data-access/equipments.store.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { EquipmentsService } from './equipments.service';
import { Equipment, CreateEquipmentDto } from '../models/equipment.model';

@Injectable({ providedIn: 'root' })
export class EquipmentsStore {
  constructor() {
    console.log('EQUIPMENTS_STORE_INSTANCIADA:', Math.random());
  }

  private readonly service = inject(EquipmentsService);

  // State
  private readonly _equipments = signal<Equipment[]>([]);
  private readonly _loading = signal(false);

  // Selectors
  readonly equipments = computed(() => this._equipments());
  readonly loading = computed(() => this._loading());

  loadByCustomer(customerId: string) {
    this.service.getByCustomer(customerId).subscribe({
      next: (data) => {
        console.log('Agora sim, na store certa:', data);
        this._equipments.set(data);
      },
    });
  }

  addEquipment(equipmentDto: CreateEquipmentDto) {
    this._loading.set(true);
    this.service.create(equipmentDto).subscribe({
      next: (newEquipment) => {
        // Atualiza o Signal adicionando o novo objeto completo (com os specs)
        this._equipments.update((current) => [...current, newEquipment]);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao salvar equipamento:', err);
        this._loading.set(false);
      },
    });
  }
}
