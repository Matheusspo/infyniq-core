// src/app/features/customers/data-access/equipments.store.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { EquipmentsService } from './equipments.service';
import { Equipment, CreateEquipmentDto } from '../models/equipment.model';
import { ToastService } from '../../../services/toast.service';

@Injectable({ providedIn: 'root' })
export class EquipmentsStore {
  private readonly service = inject(EquipmentsService);
  private toast = inject(ToastService);

  // State
  private readonly _equipments = signal<Equipment[]>([]);
  private readonly _loading = signal(false);

  // Selectors
  readonly equipments = computed(() => this._equipments());
  readonly loading = computed(() => this._loading());

  loadByCustomer(customerId: string) {
    console.log('--- STORE: Tentando carregar para o ID:', customerId);
    this._loading.set(true);

    if (!this.service) {
      console.error('ERRO: O Service não foi injetado na Store!');
      return;
    }
    // Aqui usamos o service de equipamentos, não o de clientes
    this.service.getByCustomer(customerId).subscribe({
      next: (data) => {
        console.log('--- STORE: Sucesso no Service!', data);
        this._equipments.set(data);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('--- STORE: Erro no Service!', err);
        this._loading.set(false);
        this._equipments.set([]); // Limpa para não mostrar lixo de outro cliente
      },
    });
  }

  addEquipment(equipmentDto: CreateEquipmentDto) {
    this._loading.set(true);
    this.service.create(equipmentDto).subscribe({
      next: (newEquipment) => {
        this._equipments.update((current) => [...current, newEquipment]);
        this.toast.showToast('Elevador cadastrado com sucesso!', 'success'); // 👈 Sucesso
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao salvar equipamento:', err);
        this.toast.showToast('Erro ao criar equipamento. Tente novamente.', 'error'); // 👈 Erro
        this._loading.set(false);
      },
    });
  }

  deleteEquipment(id: string) {
    if (!confirm('Tem certeza que deseja excluir este prontuário técnico?')) return;

    this._loading.set(true);
    this.service.delete(id).subscribe({
      next: () => {
        this._equipments.update((list) => list.filter((item) => item.id !== id));
        this.toast.showToast('Equipamento removido do sistema.', 'success'); // 👈 Sucesso
        this._loading.set(false);
      },
      error: (err) => {
        this.toast.showToast('Erro ao excluir. O servidor não respondeu.', 'error'); // 👈 Erro
        this._loading.set(false);
      },
    });
  }

  updateEquipment(id: string, changes: Partial<Equipment>) {
    this._loading.set(true);
    this.service.update(id, changes).subscribe({
      next: (updated) => {
        this._equipments.update((list) => list.map((item) => (item.id === id ? updated : item)));
        this.toast.showToast('Alterações salvas com sucesso!', 'success'); // 👈 Sucesso
        this._loading.set(false);
      },
      error: (err) => {
        this.toast.showToast('Falha ao salvar. Verifique a conexão.', 'error'); // 👈 Erro
        this._loading.set(false);
      },
    });
  }
}
