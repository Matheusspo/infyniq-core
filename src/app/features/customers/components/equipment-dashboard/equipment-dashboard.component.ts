// src/app/features/customers/components/equipment-dashboard/equipment-dashboard.component.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentsStore } from '../../data-access/equipments.store';
import { CustomersStore } from '../../data-access/customers.store';

@Component({
  selector: 'app-equipment-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-dashboard.component.html',
})
export class EquipmentDashboardComponent {
  private customersStore = inject(CustomersStore);

  @Input() customerName: string | undefined = '';
  @Output() add = new EventEmitter<void>();

  readonly equipments = this.customersStore.equipments;

  onAddEquipment() {
    this.add.emit();
  }
}
