import { Injectable, signal, computed, inject } from '@angular/core';
import { OrderService, OSStatus } from '../models/order-service.model';
import { OrderServiceApiService } from '../services/order-service.service';
import { ToastService } from '../../../services/toast.service';

@Injectable({ providedIn: 'root' })
export class OrderServiceStore {
  private apiService = inject(OrderServiceApiService);
  private toast = inject(ToastService);

  private ordersSignal = signal<OrderService[]>([]);
  readonly statusFilter = signal<OSStatus | 'ALL'>('ALL');
  readonly loading = signal(false);

  // 1. Filtro e Ordenação (Mais recentes primeiro)
  readonly filteredOrders = computed(() => {
    const filter = this.statusFilter();
    let orders = [...this.ordersSignal()].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    if (filter === 'ALL') return orders;
    return orders.filter((os) => os.status === filter);
  });

  // ✨ 2. CONTADOR DE EMERGÊNCIAS (O que estava faltando)
  // Conta ordens marcadas como emergência que não estão concluídas nem canceladas
  readonly emergencyCount = computed(
    () =>
      this.ordersSignal().filter(
        (os) => os.isEmergency && os.status !== 'COMPLETED' && os.status !== 'CANCELLED',
      ).length,
  );

  loadOrders() {
    this.loading.set(true);
    this.apiService.getAll().subscribe({
      next: (orders) => {
        this.ordersSignal.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar ordens:', err);
        this.loading.set(false);
      },
    });
  }

  addOrder(payload: any) {
    this.apiService.create(payload).subscribe({
      next: (serverCreatedOrder) => {
        // Adicionamos a nova ordem ao sinal.
        // O computed 'filteredOrders' cuidará de colocar no topo.
        this.ordersSignal.update((prev) => [serverCreatedOrder, ...prev]);
        this.toast.showToast(`O.S. ${serverCreatedOrder.osNumber} criada com sucesso!`, 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Erro ao criar O.S.';
        this.toast.showToast(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, 'error');
      },
    });
  }

  updateOrder(payload: any) {
    this.loading.set(true);
    this.apiService.update(payload.id, payload).subscribe({
      next: (serverUpdatedOrder) => {
        this.ordersSignal.update((prev) =>
          prev.map((o) => (o.id === serverUpdatedOrder.id ? serverUpdatedOrder : o)),
        );
        this.loading.set(false);
        this.toast.showToast(`O.S. atualizada com sucesso!`, 'success');
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Erro ao atualizar O.S.';
        this.toast.showToast(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, 'error');
      },
    });
  }

  finalizeOrder(id: string) {
    this.loading.set(true);

    // Criamos o payload mínimo necessário
    const payload = {
      status: 'COMPLETED' as OSStatus,
      updatedBy: 'Henrique (Admin)',
    };

    // Chamamos o serviço de API passando o ID separado do payload
    this.apiService.update(id, payload).subscribe({
      next: (serverUpdatedOrder) => {
        // Atualizamos o sinal localmente substituindo o item antigo
        this.ordersSignal.update((prev) =>
          prev.map((o) => (o.id === serverUpdatedOrder.id ? serverUpdatedOrder : o)),
        );
        this.loading.set(false);
        this.toast.showToast(
          `O.S. ${serverUpdatedOrder.osNumber} finalizada e estoque baixado!`,
          'success',
        );
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erro ao finalizar:', err);
        this.toast.showToast('Erro ao finalizar O.S.', 'error');
      },
    });
  }
}
