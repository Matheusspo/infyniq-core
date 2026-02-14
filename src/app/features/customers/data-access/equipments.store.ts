import { Injectable, inject, signal, computed } from '@angular/core';
import { EquipmentsService } from './equipments.service';
import { Equipment, CreateEquipmentDto } from '../models/equipment.model';
import { ToastService } from '../../../services/toast.service';

@Injectable({ providedIn: 'root' })
export class EquipmentsStore {
  private readonly service = inject(EquipmentsService);
  private readonly toast = inject(ToastService);

  // --- STATE (Sinais Privados) ---
  private readonly _equipments = signal<Equipment[]>([]);
  private readonly _loading = signal(false);
  private readonly _searchTerm = signal('');

  // --- SELECTORS (Sinais Públicos / Computados) ---

  // Retorna a lista bruta
  readonly equipments = computed(() => this._equipments());

  // Retorna o estado de carregamento
  readonly loading = computed(() => this._loading());

  // Retorna o termo de busca atual
  readonly searchTerm = computed(() => this._searchTerm());

  // TOQUE PREMIUM: Filtro Reativo em tempo real
  readonly filteredEquipments = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const list = this._equipments();

    if (!term) return list;

    return list.filter(
      (eq) =>
        eq.name.toLowerCase().includes(term) ||
        eq.brand.toLowerCase().includes(term) ||
        eq.model?.toLowerCase().includes(term) ||
        eq.serialNumber?.toLowerCase().includes(term),
    );
  });

  // --- MÉTODOS DE AÇÃO ---

  /**
   * Atualiza o termo de busca para disparar o computed 'filteredEquipments'
   */
  updateSearchTerm(term: string) {
    this._searchTerm.set(term);
  }

  /**
   * Carrega os equipamentos de um cliente específico
   */
  loadByCustomer(customerId: string) {
    this._loading.set(true);
    this._searchTerm.set(''); // Reseta a busca ao trocar de cliente

    this.service.getByCustomer(customerId).subscribe({
      next: (data) => {
        // Ordena por nome antes de salvar no estado
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        this._equipments.set(sortedData);
        this._loading.set(false);
      },
      error: (err) => {
        console.error('Erro na Store ao carregar:', err);
        this._equipments.set([]);
        this._loading.set(false);
        this.toast.showToast('Erro ao carregar equipamentos.', 'error');
      },
    });
  }

  /**
   * Adiciona um novo elevador
   */
  addEquipment(equipmentDto: CreateEquipmentDto) {
    this._loading.set(true);
    this.service.create(equipmentDto).subscribe({
      next: (newEquipment) => {
        this._equipments.update((current) => [...current, newEquipment]);
        this.toast.showToast('Elevador cadastrado com sucesso!', 'success');
        this._loading.set(false);
      },
      error: (err) => {
        this.toast.showToast('Erro ao criar equipamento.', 'error');
        this._loading.set(false);
      },
    });
  }

  /**
   * Remove um elevador
   */
  deleteEquipment(id: string) {
    this._loading.set(true);
    this.service.delete(id).subscribe({
      next: () => {
        this._equipments.update((list) => list.filter((item) => item.id !== id));
        this.toast.showToast('Equipamento removido.', 'success');
        this._loading.set(false);
      },
      error: (err) => {
        this.toast.showToast('Erro ao excluir do servidor.', 'error');
        this._loading.set(false);
      },
    });
  }

  /**
   * Atualiza dados de um elevador existente
   */
  updateEquipment(id: string, changes: Partial<Equipment>) {
    this._loading.set(true);
    this.service.update(id, changes).subscribe({
      next: (updated) => {
        this._equipments.update((list) =>
          list.map((item) => (item.id === id ? { ...item, ...updated } : item)),
        );
        this.toast.showToast('Alterações salvas!', 'success');
        this._loading.set(false);
      },
      error: (err) => {
        this.toast.showToast('Falha ao atualizar dados.', 'error');
        this._loading.set(false);
      },
    });
  }
}
