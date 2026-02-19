// src/app/features/customers/customers-container.component.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../data-access/customers.store';
import { EquipmentsStore } from '../data-access/equipments.store'; // 👈 Importe a store nova
import { EquipmentDashboardComponent } from '../components/equipment-dashboard/equipment-dashboard.component'; // 👈 Importe o dashboard
import { EquipmentFormComponent } from '../components/equipment-form/equipment-form.component'; // 👈 Importe o form novo
import { CustomersListComponent } from '../components/customers-list/customers-list.component';
import { CustomerFormComponent } from '../components/customer-form/customer-form.component';
import { Customer } from '../models/customer.model';
import { CreateEquipmentDto, Equipment } from '../models/equipment.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-customers-container',
  standalone: true,
  imports: [
    CommonModule,
    CustomersListComponent,
    CustomerFormComponent,
    EquipmentDashboardComponent,
    EquipmentFormComponent,
  ],
  templateUrl: './customers-container.component.html',
})
export class CustomersContainerComponent {
  // Injeção das Stores
  protected readonly customersStore = inject(CustomersStore);
  protected readonly equipmentsStore = inject(EquipmentsStore);
  private readonly toast = inject(ToastService);

  // Signals para controlar a exibição dos formulários (Modais)
  showCustomerForm = signal(false);
  showEquipmentForm = signal(false);
  selectedEquipment = signal<Equipment | null>(null);
  
  // Estado para edição de cliente
  customerToEdit = signal<Customer | null>(null);

  viewMode = signal<'LIST' | 'DETAIL'>('LIST');

  // Atalhos para os Signals das Stores (para o HTML limpar os erros)
  readonly selectedCustomer = this.customersStore.selectedCustomer;
  readonly customers = this.customersStore.filteredCustomers;
  readonly equipments = computed(() => this.equipmentsStore.equipments());

  ngOnInit() {
    this.customersStore.loadAllCustomers();
  }

  onCustomerSelect(customer: any) {
    this.customersStore.selectCustomer(customer);

    if (customer && customer.id) {
      this.equipmentsStore.loadByCustomer(customer.id);
      this.viewMode.set('DETAIL');
    }
  }

  // --- Métodos de Cliente ---
  onOpenNewCustomer() {
    this.customerToEdit.set(null);
    this.showCustomerForm.set(true);
  }

  onEditCustomer(customer: Customer) {
    this.customerToEdit.set(customer);
    this.showCustomerForm.set(true);
  }

  onSaveCustomer(customerData: any) {
    const editing = this.customerToEdit();
    
    if (editing) {
       this.customersStore.updateCustomer(editing.id, customerData);
    } else {
       this.customersStore.addCustomer(customerData);
    }

    // Fecha o modal
    this.showCustomerForm.set(false);
    this.customerToEdit.set(null);
  }

  // --- Métodos de Equipamento ---
  openEquipmentForm() {
    this.showEquipmentForm.set(true);
  }

  onSaveEquipment(formData: any) {
    const editing = this.selectedEquipment();

    if (editing) {
      // EDIÇÃO
      this.equipmentsStore.updateEquipment(editing.id, formData);
      this.toast.showToast('Prontuário técnico atualizado!', 'success'); // 👈 Chamando seu Toast
    } else {
      // CRIAÇÃO
      const customerId = this.selectedCustomer()?.id;
      this.equipmentsStore.addEquipment({ ...formData, customerId });
      this.toast.showToast('Novo elevador cadastrado com sucesso!', 'success'); // 👈 Chamando seu Toast
    }

    this.closeEquipmentModal();
  }

  openEditForm(equipment: Equipment) {
    this.selectedEquipment.set(equipment);
    this.showEquipmentForm.set(true);
  }

  closeEquipmentModal() {
    this.showEquipmentForm.set(false);
    this.selectedEquipment.set(null);
  }

  onEditEquipment(equipment: Equipment) {
    console.log('Editando equipamento:', equipment);
    this.selectedEquipment.set(equipment);
    this.showEquipmentForm.set(true);
  }

  goBackToList() {
    this.viewMode.set('LIST');
    this.customersStore.selectCustomer(null as any);
  }

  onSearch(event: Event) {
    // Captura o valor do input com segurança
    const input = event.target as HTMLInputElement;
    this.customersStore.updateSearchTerm(input.value);
  }
}
