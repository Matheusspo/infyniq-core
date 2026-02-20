import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentsStore } from '../../data-access/equipments.store';
import { Equipment } from '../../models/equipment.model';
import { CustomerHistoryComponent } from '../customer-history/customer-history.component';

@Component({
  selector: 'app-equipment-dashboard',
  standalone: true,
  imports: [CommonModule, CustomerHistoryComponent],
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
  public readonly store = inject(EquipmentsStore);

  @Input() customerName: string | undefined = '';
  @Output() addEquipment = new EventEmitter<void>();
  @Output() editEquipment = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();

  // Mapeamento para o HTML usar
  readonly driveTypeMap: Record<string, string> = {
    GEARED: 'Com Engrenagem',
    GEARLESS: 'Sem Engrenagem',
    HYDRAULIC: 'Hidráulico',
  };

  // Signal para controlar a visibilidade e abas
  readonly showScrollTop = signal(false);
  readonly activeTab = signal<'EQUIPMENTS' | 'HISTORY'>('EQUIPMENTS');

  // Monitora o scroll da DIV interna
  onDivScroll(container: HTMLElement) {
    // Aparece após rolar 300px para baixo
    this.showScrollTop.set(container.scrollTop > 300);
  }

  // Faz o scroll suave de volta ao topo da DIV
  scrollToTop(container: HTMLElement) {
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // Métodos de ação simplificados
  onFilterEquipments(value: string) {
    this.store.updateSearchTerm(value);
  }

  onDelete(id: string) {
    this.store.deleteEquipment(id);
  }

  onAddEquipment() {
    this.addEquipment.emit();
  }

  onEditEquipment(item: Equipment) {
    this.editEquipment.emit(item);
  }

  onBack() {
    this.back.emit();
  }
}
