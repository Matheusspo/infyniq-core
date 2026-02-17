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

  // 1. ORDENAÇÃO: Mais recentes primeiro (Computed)
  // Fazemos o sort aqui para que a listagem sempre reflita a ordem correta
  readonly filteredOrders = computed(() => {
    const filter = this.statusFilter();
    // Criamos uma cópia para ordenar sem mutar o signal original
    let orders = [...this.ordersSignal()].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Decrescente: mais recente no topo
    });

    if (filter === 'ALL') return orders;
    return orders.filter((os) => os.status === filter);
  });

  readonly emergencyCount = computed(
    () => this.ordersSignal().filter((os) => os.isEmergency && os.status !== 'COMPLETED').length,
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

  addOrder(uiOrder: any) {
    // Destruturamos para NÃO enviar os nomes ao banco, mas guardá-los para a UI
    const { customerName, technicianName, equipmentName, ...apiPayload } = uiOrder;

    this.apiService.create(apiPayload).subscribe({
      next: (serverCreatedOrder) => {
        // 2. RESPONSÁVEL: Mesclamos os nomes da UI com os dados do servidor
        const finalOrder = {
          ...uiOrder, // Aqui pegamos os nomes que o usuário selecionou no form
          ...serverCreatedOrder, // Aqui pegamos o ID e datas geradas pelo banco
        };

        // Adicionamos no início da lista (o computed fará a ordenação oficial depois)
        this.ordersSignal.update((prev) => [finalOrder, ...prev]);
        this.toast.showToast(`O.S. ${finalOrder.osNumber} criada com sucesso!`, 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.message?.[0] || 'Erro ao conectar com o servidor';
        this.toast.showToast(errorMsg, 'error');
      },
    });
  }

  updateOrder(uiOrder: any) {
    this.loading.set(true);
    const { customerName, technicianName, equipmentName, ...apiPayload } = uiOrder;

    this.apiService.update(apiPayload.id, apiPayload).subscribe({
      next: (serverUpdatedOrder) => {
        this.ordersSignal.update((prev) => {
          const index = prev.findIndex((o) => o.id === uiOrder.id);
          if (index === -1) return prev;

          const newOrders = [...prev];
          // Mantemos os nomes que já estavam na UI para não "limpar" o card
          newOrders[index] = {
            ...uiOrder,
            ...serverUpdatedOrder,
            // Garantimos que os nomes persistam caso o servidor não os envie
            customerName: uiOrder.customerName,
            technicianName: uiOrder.technicianName,
            equipmentName: uiOrder.equipmentName,
          };
          return newOrders;
        });

        this.loading.set(false);
        this.toast.showToast(`O.S. atualizada com sucesso!`, 'success');
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err.error?.message?.[0] || 'Erro ao atualizar no servidor';
        this.toast.showToast(errorMsg, 'error');
      },
    });
  }
}
