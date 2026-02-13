import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../../data-access/customers.store';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers-list.component.html',
})
export class CustomersListComponent implements OnInit {
  public readonly store = inject(CustomersStore);

  @Input() customers: Customer[] = [];

  @Output() select = new EventEmitter<Customer>();

  ngOnInit() {
    this.store.loadAllCustomers();
  }

  onSelect(customer: Customer) {
    this.store.selectCustomer(customer);
  }
}
