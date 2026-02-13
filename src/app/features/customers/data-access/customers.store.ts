// src/app/features/customers/data-access/customers.store.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { CustomersService } from './customers.service';
import { Customer } from '../models/customer.model';
import { ToastService } from '../../../services/toast.service';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomersStore {
  private readonly service = inject(CustomersService);
  private readonly toast = inject(ToastService);

  // Estados (Signals Privados para controle)
  private readonly _customers = signal<Customer[]>([]);
  private readonly _searchTerm = signal<string>('');

  readonly selectedCustomer = signal<Customer | null>(null);
  readonly loading = signal(false);
  readonly displayLimit = signal(20);

  // Selectors (Computed) - O que o componente consome
  readonly customers = computed(() => this._customers());
  readonly searchTerm = computed(() => this._searchTerm());
  readonly totalUnits = computed(() => this._customers().length);
  readonly totalEquipments = computed(() => {
    return this._customers().reduce((acc, customer) => acc + (customer.equipments?.length || 0), 0);
  });
  readonly displayedCustomers = computed(() => {
    return this.filteredCustomers().slice(0, this.displayLimit());
  });

  readonly maintenancesToday = computed(() => {
    // Por enquanto retornamos um valor fixo ou baseado em alguma flag
    // Exemplo: return this._customers().filter(c => c.hasPendingService).length;
    return 8;
  });

  // O motor de busca reativo
  readonly filteredCustomers = computed(() => {
    const term = this._searchTerm().toLowerCase().trim();
    const list = this._customers(); // Aqui ele lê do sinal privado
    if (!term) return list;
    return list.filter((c) => c.name.toLowerCase().includes(term));
  });

  loadMore() {
    this.displayLimit.update((limit) => limit + 20);
  }

  updateSearchTerm(term: string) {
    this._searchTerm.set(term);
  }

  loadAllCustomers() {
    this.loading.set(true);

    this.service
      .getCustomers()
      .pipe(
        // O finalize roda se der certo OU se der erro. É infalível.
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (data) => this._customers.set(data),
        error: (err) => {
          console.error('Erro:', err);
          this.toast.showToast('Erro ao carregar dados', 'error');
        },
      });
  }

  addCustomer(customerData: Partial<Customer>) {
    this.loading.set(true);
    this.service.createCustomer(customerData).subscribe({
      next: (newCustomer) => {
        // Adiciona à lista mantendo o filtro ativo se houver
        this._customers.update((all) => [...all, newCustomer]);
        this.toast.showToast(`${newCustomer.name} cadastrado!`, 'success');
      },
      error: (err) => this.toast.showToast('Erro ao salvar condomínio', 'error'),
      complete: () => this.loading.set(false),
    });
  }

  selectCustomer(customer: Customer | null) {
    this.selectedCustomer.set(customer);
  }

  clearSelection() {
    this.selectedCustomer.set(null);
  }
}
