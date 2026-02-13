// src/app/features/customers/customers-container.component.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../data-access/customers.store';
import { EquipmentsStore } from '../data-access/equipments.store'; // 👈 Importe a store nova
import { EquipmentDashboardComponent } from '../components/equipment-dashboard/equipment-dashboard.component'; // 👈 Importe o dashboard
import { EquipmentFormComponent } from '../components/equipment-form/equipment-form.component'; // 👈 Importe o form novo
import { CustomersListComponent } from '../components/customers-list/customers-list.component';
import { CustomerFormComponent } from '../components/customer-form/customer-form.component';
import { CreateEquipmentDto } from '../models/equipment.model';

@Component({
  selector: 'app-customers-container',
  standalone: true,
  imports: [
    CommonModule,
    CustomersListComponent,
    CustomerFormComponent,
    EquipmentDashboardComponent, // 👈 Adicione aqui
    EquipmentFormComponent, // 👈 Adicione aqui
  ],
  templateUrl: './customers-container.component.html',
})
export class CustomersContainerComponent {
  // Injeção das Stores
  protected readonly customersStore = inject(CustomersStore);
  protected readonly equipmentsStore = inject(EquipmentsStore);

  // Signals para controlar a exibição dos formulários (Modais)
  showCustomerForm = signal(false);
  showEquipmentForm = signal(false);

  // Atalhos para os Signals das Stores (para o HTML limpar os erros)
  readonly selectedCustomer = this.customersStore.selectedCustomer;
  readonly customers = this.customersStore.customers;
  readonly equipments = computed(() => this.equipmentsStore.equipments());

  // --- Métodos de Cliente ---
  onCustomerSelect(customer: any) {
    this.customersStore.selectCustomer(customer);

    this.equipmentsStore.loadByCustomer(customer.id);
  }

  onSaveCustomer(customerData: any) {
    // 1. Chama a store para persistir no backend/JSON
    this.customersStore.addCustomer(customerData);

    // 2. Fecha o modal de cadastro de cliente
    this.showCustomerForm.set(false);
  }

  // --- Métodos de Equipamento ---
  openEquipmentForm() {
    this.showEquipmentForm.set(true);
  }

  onSaveEquipment(formData: any) {
    const customer = this.selectedCustomer();
    if (!customer?.id) return;

    const equipmentDto: CreateEquipmentDto = {
      ...formData,
      customerId: customer.id,
    };

    // Certifique-se de que o addEquipment na sua Store
    // atualiza o signal interno após o sucesso do POST
    this.equipmentsStore.addEquipment(equipmentDto);
    this.showEquipmentForm.set(false);
  }
}
