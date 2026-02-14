import { Injectable, signal, computed } from '@angular/core';
import { OrderService } from '../models/order-service.model'; // Verifique o caminho

@Injectable({
  providedIn: 'root',
})
export class OSStore {
  // 1. Signals (Estado)
  readonly orders = signal<OrderService[]>([]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal<string>('ALL');

  // 2. Computed (Estado Derivado)
  readonly filteredOrders = computed(() => {
    const list = this.orders();
    const term = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return list.filter((os) => {
      const matchesSearch =
        os.osNumber.toLowerCase().includes(term) || os.customerName.toLowerCase().includes(term);
      const matchesStatus = status === 'ALL' || os.status === status;
      return matchesSearch && matchesStatus;
    });
  });

  // 3. Métodos de Atualização
  setOrders(orders: OrderService[]) {
    this.orders.set(orders);
  }

  updateSearch(term: string) {
    this.searchTerm.set(term);
  }

  updateStatus(status: string) {
    this.statusFilter.set(status);
  }
}
