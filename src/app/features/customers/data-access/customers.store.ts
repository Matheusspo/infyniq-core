// src/app/features/customers/data-access/customers.store.ts

import { Injectable, inject, signal, computed } from '@angular/core';
import { CustomersService } from './customers.service';
import { Customer } from '../models/customer.model';
import { Equipment } from '../models/equipment.model';
import { ToastService } from '../../../services/toast.service';

@Injectable({ providedIn: 'root' })
export class CustomersStore {
  private readonly service = inject(CustomersService);
  private readonly toast = inject(ToastService);

  // Estados (Signals)
  readonly customers = signal<Customer[]>([]);
  readonly selectedCustomer = signal<Customer | null>(null);
  readonly equipments = signal<Equipment[]>([]);
  readonly loading = signal(false);

  // Ação: Carregar todos os clientes (Condomínios)
  loadAllCustomers() {
    this.loading.set(true);
    this.service.getCustomers().subscribe({
      next: (data) => this.customers.set(data),
      error: (err) => console.error('Erro ao buscar clientes', err),
      complete: () => this.loading.set(false),
    });
  }

  // Ação: Selecionar um cliente e buscar seus elevadores
  selectCustomer(customer: Customer) {
    this.selectedCustomer.set(customer);
    this.loading.set(true);
    this.service.getEquipmentsByCustomer(customer.id).subscribe({
      next: (data) => {
        console.log('Dados de equipamentos recebidos:', data);
        this.equipments.set(data);
      },
      error: (err) => console.error('Erro ao buscar elevadores', err),
      complete: () => this.loading.set(false),
    });
  }

  // Ação: Limpar seleção (Usado no botão "Trocar")
  clearSelection() {
    this.selectedCustomer.set(null);
    this.equipments.set([]);
  }

  addCustomer(customerData: Partial<Customer>) {
    this.loading.set(true);

    this.service.createCustomer(customerData).subscribe({
      next: (newCustomer) => {
        // Atualiza a lista de clientes adicionando o novo ao array atual
        // Usamos o update() do signal para garantir imutabilidade
        this.customers.update((allCustomers) => [...allCustomers, newCustomer]);

        this.toast.showToast(`Cliente cadastrado com sucesso!`, 'success');
        // Opcional: Se quiser que ele já fique selecionado após criar:
        // this.selectCustomer(newCustomer);
      },
      error: (err) => {
        console.error('Erro ao cadastrar cliente', err);
        // Aqui você poderia setar um signal de 'errorMessage' se quiser mostrar na tela
      },
      complete: () => this.loading.set(false),
    });
  }
}
