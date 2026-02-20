import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../customers/data-access/customers.store';
import { OrderServiceStore } from '../orders/store/order-service.store';
import { StockStore } from '../estoque/stock.store';
import { CustomersMapComponent } from './components/customers-map/customers-map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CustomersMapComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  protected readonly customersStore = inject(CustomersStore);
  protected readonly osStore = inject(OrderServiceStore);
  protected readonly stockStore = inject(StockStore);

  // --- Métricas Consolidadas (Signals Reativos) ---
  
  // Operações (O.S.)
  readonly emergencyCount = computed(() => this.osStore.emergencyCount());
  readonly todayOS = computed(() => this.osStore.maintenanceCountToday());
  readonly pendingOS = computed(() => 
    this.osStore.orders().filter(os => os.status === 'OPEN' || os.status === 'IN_PROGRESS').length
  );

  // Inventário (Estoque)
  readonly stockValue = computed(() => this.stockStore.totalStockValue());
  readonly criticalStock = computed(() => this.stockStore.criticalItemsCount());

  // Ativos (Clientes/Equipamentos)
  readonly totalCustomers = computed(() => this.customersStore.totalUnits());
  readonly totalEquipments = computed(() => this.customersStore.totalEquipments());

  ngOnInit(): void {
    // Orquestra a carga de dados para o Dash Executivo
    this.stockStore.loadAll();
    this.osStore.loadOrders();
    this.customersStore.loadAllCustomers();
  }
}
