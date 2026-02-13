import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from '../../data-access/customers.store';
import { Customer } from '../../models/customer.model';
import { PhonePipe } from '../../../../pipe/phone.pipe';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, PhonePipe],
  templateUrl: './customers-list.component.html',
})
export class CustomersListComponent {
  public readonly store = inject(CustomersStore);

  @Input() customers: Customer[] = [];

  @Output() select = new EventEmitter<Customer>();

  onSelect(customer: Customer) {
    this.select.emit(customer);
  }

  onViewEquipments(customer: any) {
    this.select.emit(customer);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.updateSearchTerm(value);
  }

  onButtonClick(event: Event, customer: Customer) {
    // Isso impede que o clique "atravesse" o botão e atinja a linha (evita duplo disparo)
    event.stopPropagation();

    // Chama a mesma lógica de seleção
    this.onSelect(customer);
  }
}
