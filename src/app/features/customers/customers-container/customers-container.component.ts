import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../data-access/customers.store'; // ajuste o caminho se necessário
import { CustomerFormComponent } from '../components/customer-form/customer-form.component';
import { CustomersListComponent } from '../components/customers-list/customers-list.component';
import { Customer } from '../models/customer.model';

@Component({
  selector: 'app-customers-container',
  standalone: true,
  imports: [CommonModule, CustomerFormComponent, CustomersListComponent],
  templateUrl: './customers-container.component.html',
})
export class CustomersContainerComponent {
  private readonly store = inject(CustomersStore);

  // 1. Defina a propriedade showForm (erro de "Property does not exist")
  showForm = false;

  // 2. Mapeie o signal de clientes da store
  customers = this.store.customers;

  // 3. Crie o método de salvar (que o seu HTML está chamando)
  onSaveCustomer(customerData: Partial<Customer>) {
    this.store.addCustomer(customerData);
    this.showForm = false;
  }

  // 4. Crie o método de seleção (o erro TS2339 que apareceu no seu log)
  onCustomerSelect(customer: Customer) {
    this.store.selectCustomer(customer);
  }
}
