import { Injectable, signal, computed, inject } from '@angular/core';
import { OrderService, OSStatus } from '../models/order-service.model';
import { OrderServiceApiService } from '../services/order-service.service';
import { ToastService } from '../../../services/toast.service';

@Injectable({ providedIn: 'root' })
export class OrderServiceStore {
  private apiService = inject(OrderServiceApiService);
  private toast = inject(ToastService);

  private ordersSignal = signal<OrderService[]>([]);
  readonly orders = this.ordersSignal.asReadonly();
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

  // ✨ 3. CONTADOR DE MANUTENÇÕES HOJE
  // Conta ordens criadas ou agendadas para hoje
  readonly maintenanceCountToday = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.ordersSignal().filter((os) => {
      const osDate = new Date(os.createdAt);
      osDate.setHours(0, 0, 0, 0);
      return osDate.getTime() === today.getTime() && os.status !== 'CANCELLED';
    }).length;
  });

  // ✨ 4. CONTADOR DE EMERGÊNCIAS
  readonly emergencyCount = computed(
    () =>
      this.ordersSignal().filter(
        (os) => os.isEmergency && os.status !== 'COMPLETED' && os.status !== 'CANCELLED',
      ).length,
  );

  // ✨ 5. HISTÓRICO E MÉTRICAS POR CLIENTE (Premium Metrics)
  // Nota: Estas estatísticas são calculadas para o cliente selecionado
  // Baseando-se no selectedCustomer da CustomersStore
  readonly getCustomerHistory = (customerId: string) => {
    return this.ordersSignal()
      .filter((os) => {
        const osCustomerId = (os.customerId as any)?.id || os.customerId;
        return osCustomerId === customerId;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Cálculo de MTBF (Mean Time Between Failures) simplificado:
  // Média de dias entre ordens Corretivas/Emergência
  readonly getCustomerMTBF = (customerId: string) => {
    const history = this.getCustomerHistory(customerId).filter(
      (os) => os.type === 'CORRECTIVE' || os.isEmergency,
    );

    if (history.length < 2) return null;

    const dates = history.map((os) => new Date(os.createdAt).getTime());
    let totalGap = 0;
    for (let i = 0; i < dates.length - 1; i++) {
      totalGap += Math.abs(dates[i] - dates[i + 1]);
    }

    const averageMs = totalGap / (dates.length - 1);
    return Math.round(averageMs / (1000 * 60 * 60 * 24)); // Retorna em dias
  };

  // Distribuição de técnicos para este cliente
  readonly getTechnicianDist = (customerId: string) => {
    const history = this.getCustomerHistory(customerId);
    const dist: Record<string, number> = {};

    history.forEach((os) => {
      const name = (os.technicianId as any)?.name || 'Desconhecido';
      dist[name] = (dist[name] || 0) + 1;
    });

    return Object.entries(dist)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

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

  startOrder(id: string) {
    this.loading.set(true);
    const payload = {
      status: 'IN_PROGRESS' as OSStatus,
      updatedBy: 'Henrique (Admin)',
    };

    this.apiService.update(id, payload).subscribe({
      next: (serverUpdatedOrder) => {
        this.ordersSignal.update((prev) =>
          prev.map((o) => (o.id === serverUpdatedOrder.id ? serverUpdatedOrder : o)),
        );
        this.loading.set(false);
        this.toast.showToast(`O.S. #${serverUpdatedOrder.osNumber} iniciada! Atendimento em andamento.`, 'info');
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.showToast('Erro ao iniciar atendimento.', 'error');
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
