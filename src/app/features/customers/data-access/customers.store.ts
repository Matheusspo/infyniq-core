// src/app/features/customers/data-access/customers.store.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { CustomersService } from './customers.service';
import { Customer } from '../models/customer.model';
import { Equipment } from '../models/equipment.model';
import { OrderServiceStore } from '../../orders/store/order-service.store';
import { ToastService } from '../../../services/toast.service';
import { finalize, switchMap, catchError, of, map } from 'rxjs';
import { GeocodingService, GeoResult } from '../../../core/services/geocoding.service';

@Injectable({ providedIn: 'root' })
export class CustomersStore {
  private readonly service = inject(CustomersService);
  private readonly toast = inject(ToastService);
  private readonly osStore = inject(OrderServiceStore);
  private readonly geocodingService = inject(GeocodingService);
  
  // Nota: O inject acima com promise é apenas ilustrativo para o Antigravity.
  // Em um cenário real de Angular 17+, usaríamos:
  // private readonly geocodingService = inject(GeocodingService);
  // Mas como GeocodingService não estava no topo dos imports, vou adicionar o import.
  private readonly _customers = signal<Customer[]>([]);
  private readonly _equipments = signal<Equipment[]>([]); // ✨ NOVO: Todos os equipamentos
  private readonly _searchTerm = signal<string>('');

  readonly selectedCustomer = signal<Customer | null>(null);
  readonly loading = signal(false);
  readonly displayLimit = signal(20);

  // Selectors (Computed) - O que o componente consome
  readonly customers = computed(() => this._customers());
  readonly searchTerm = computed(() => this._searchTerm());
  readonly totalUnits = computed(() => this._customers().length);
  
  // ✨ Agora conta o total real de todos os equipamentos cadastrados no sistema
  readonly totalEquipments = computed(() => this._equipments().length);
  
  readonly displayedCustomers = computed(() => {
    return this.filteredCustomers().slice(0, this.displayLimit());
  });

  // ✨ Integrado com a Store de O.S. para retornar o valor real de hoje
  readonly maintenancesToday = computed(() => this.osStore.maintenanceCountToday());

  // ✨ Inteligência de Manutenção: Preventivas Pendentes e Próximas
  readonly pendingPreventivesCount = computed(() => {
    const today = new Date();
    return this._equipments().filter(eq => {
      if (!eq.nextPreventiveDate) return false;
      const nextDate = new Date(eq.nextPreventiveDate);
      return nextDate < today;
    }).length;
  });

  readonly upcomingPreventivesCount = computed(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return this._equipments().filter(eq => {
      if (!eq.nextPreventiveDate) return false;
      const nextDate = new Date(eq.nextPreventiveDate);
      return nextDate >= today && nextDate <= nextWeek;
    }).length;
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

  loadAllEquipments() {
    this.service.getAllEquipments().subscribe({
      next: (data) => this._equipments.set(data),
      error: (err) => console.error('Erro ao carregar equipamentos globais:', err)
    });
  }

  loadAllCustomers() {
    this.loading.set(true);

    // Carrega tudo que é necessário para as estatísticas reais
    this.osStore.loadOrders();
    this.loadAllEquipments();

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
    
    // Geocodificação automática antes de salvar
    const obs$ = customerData.address 
      ? this.geocodingService.geocode(customerData.address).pipe(
          map((coords: { lat: number; lng: number } | null) => ({ ...customerData, ...coords })),
          catchError(() => of(customerData)) // Se falhar, salva sem coords
        )
      : of(customerData);

    obs$.pipe(
      switchMap((data: Partial<Customer>) => this.service.createCustomer(data)),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (newCustomer) => {
        this._customers.update((all) => [...all, newCustomer]);
        this.toast.showToast(`${newCustomer.name} cadastrado!`, 'success');
      },
      error: (err) => this.toast.showToast('Erro ao salvar condomínio', 'error')
    });
  }

  updateCustomer(id: string, data: Partial<Customer>) {
    this.loading.set(true);

    // Se o endereço mudou, re-geocodifica
    const obs$ = data.address 
      ? this.geocodingService.geocode(data.address).pipe(
          map((coords: { lat: number; lng: number } | null) => ({ ...data, ...coords })),
          catchError(() => of(data))
        )
      : of(data);

    obs$.pipe(
      switchMap((payload: Partial<Customer>) => this.service.updateCustomer(id, payload)),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (updated) => {
        this._customers.update((list) =>
          list.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        );
        this.toast.showToast('Condomínio atualizado!', 'success');
      },
      error: (err) => this.toast.showToast('Erro ao atualizar', 'error'),
    });
  }

  selectCustomer(customer: Customer | null) {
    this.selectedCustomer.set(customer);
  }

  clearSelection() {
    this.selectedCustomer.set(null);
  }
}
