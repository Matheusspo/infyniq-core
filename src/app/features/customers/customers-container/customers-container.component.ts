import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../data-access/customers.store';
import { CustomerListComponent } from '../components/customer-list/customer-list.component';
import { EquipmentFormComponent } from '../components/equipment-form/equipment-form.component';

@Component({
  selector: 'app-customers-container',
  standalone: true,
  imports: [CommonModule, CustomerListComponent, EquipmentFormComponent],
  templateUrl: './customers-container.component.html',
  styles: [
    `
      :host {
        display: block;
        background-color: #f9fafb; /* bg-gray-50 */
        min-height: 100vh;
      }
    `,
  ],
})
export class CustomersContainerComponent {
  // Injetamos a Store para que o HTML possa usar store.selectedCustomer()
  public readonly store = inject(CustomersStore);

  constructor() {
    // Opcional: Você pode carregar os dados aqui ou no ngOnInit da Listagem
    // this.store.loadAllCustomers();
  }
}
