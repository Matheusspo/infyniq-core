// src/app/features/customers/components/equipment-dashboard/equipment-dashboard.component.ts
import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { EquipmentsStore } from '../../data-access/equipments.store';

@Component({
  selector: 'app-equipment-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './equipment-dashboard.component.html',
  styles: [
    `
      :host {
        display: block;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
})
export class EquipmentDashboardComponent {
  public equipmentsStore = inject(EquipmentsStore);

  readonly equipments = this.equipmentsStore.equipments;
  searchTerm = signal('');

  @Input() customerName: string | undefined = '';
  @Output() addEquipment = new EventEmitter<void>();
  @Output() editEquipment = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  get filteredEquipments() {
    const term = this.searchTerm().toLowerCase();
    return this.equipments().filter(
      (eq) => eq.name.toLowerCase().includes(term) || eq.brand.toLowerCase().includes(term),
    );
  }

  onAddEquipment() {
    this.addEquipment.emit();
  }

  onEditEquipment(item: any) {
    this.editEquipment.emit(item);
  }

  onDelete(id: string) {
    this.equipmentsStore.deleteEquipment(id);
  }

  onBack() {
    this.back.emit();
  }

  readonly driveTypeMap: Record<string, string> = {
    GEARED: 'Com Engrenagem',
    GEARLESS: 'Sem Engrenagem',
    HYDRAULIC: 'Hidráulico',
  };

  onFilterEquipments(value: string) {
    this.searchTerm.set(value);
  }
}
