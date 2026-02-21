import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnInit,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentsStore } from '../../data-access/equipments.store';
import { Equipment } from '../../models/equipment.model';
import { CustomerHistoryComponent } from '../customer-history/customer-history.component';
import { EquipmentStatusModalComponent } from '../equipment-status-modal/equipment-status-modal.component';
import { OrderServiceStore } from '../../../orders/store/order-service.store';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-equipment-dashboard',
  standalone: true,
  imports: [CommonModule, CustomerHistoryComponent, EquipmentStatusModalComponent],
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
export class EquipmentDashboardComponent implements OnInit {
  public readonly store = inject(EquipmentsStore);
  private readonly orderServiceStore = inject(OrderServiceStore);
  private readonly toast = inject(ToastService);

  @Input() customerName: string | undefined = '';
  @Input() isStandalone: boolean = false;
  @Output() addEquipment = new EventEmitter<void>();
  @Output() editEquipment = new EventEmitter<any>();
  @Output() updateStatus = new EventEmitter<{equipment: any, newStatus: string}>();
  @Output() back = new EventEmitter<void>();

  statusModalEquipment = signal<any | null>(null);

  // Mapeamento para o HTML usar
  readonly driveTypeMap: Record<string, string> = {
    GEARED: 'Com Engrenagem',
    GEARLESS: 'Sem Engrenagem',
    HYDRAULIC: 'Hidráulico',
  };

  // Signal para controlar a visibilidade e abas
  readonly showScrollTop = signal(false);
  readonly activeTab = signal<'EQUIPMENTS' | 'HISTORY'>('EQUIPMENTS');

  // Monitora o scroll da página (Window)
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollTop.set(scrollOffset > 500);
  }

  // Faz o scroll suave de volta ao topo da página
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  // Métodos de ação simplificados
  readonly latestPreventive = computed(() => {
    // Retorna a melhor data (por exemplo a data da próxima preventiva mais próxima)
    return null; // Implementar caso precise no card superior
  });

  ngOnInit() {
    // Assegura que as O.S. estão carregadas para a validação de status
    this.orderServiceStore.loadOrders();
  }

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

  onEditStatus(equipment: any) {
    // Recupera todas as O.S. em andamento ou abertas
    const openOrders = this.orderServiceStore.orders().filter(os => 
      os.equipmentId === equipment.id && 
      (os.status === 'OPEN' || os.status === 'IN_PROGRESS')
    );

    if (openOrders.length > 0) {
      this.toast.showToast(
        `Não é possível alterar o status. O elevador possui O.S. #${openOrders[0].osNumber} em andamento.`, 
        'error'
      );
      return;
    }

    this.statusModalEquipment.set(equipment);
  }

  onStatusSelect(status: string) {
    const equip = this.statusModalEquipment();
    if (equip) {
      this.updateStatus.emit({ equipment: equip, newStatus: status });
    }
    this.statusModalEquipment.set(null);
  }

  closeStatusModal() {
    this.statusModalEquipment.set(null);
  }
}
