import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../../data-access/customers.store';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  public readonly store = inject(CustomersStore);

  ngOnInit() {
    this.store.loadAllCustomers();
  }

  onSelect(customer: Customer) {
    this.store.selectCustomer(customer);
  }
}
