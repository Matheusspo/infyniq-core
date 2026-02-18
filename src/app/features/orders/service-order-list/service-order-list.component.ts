import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderServiceStore } from '../store/order-service.store';
import { OSFormComponent } from '../service-order-form/service-order-form.component';
import { OrderService, OSStatus } from '../models/order-service.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { TechniciansService } from '../../technicians/data-access/technicians.service';
import { Technician } from '../../technicians/models/technician.model';

@Component({
  selector: 'app-os-list',
  standalone: true,
  imports: [CommonModule, OSFormComponent],
  templateUrl: './service-order-list.component.html',
})
export class OSListComponent implements OnInit {
  // 1. Injeção de Dependências
  public osStore = inject(OrderServiceStore);
  private techService = inject(TechniciansService);

  isDrawerOpen = signal(false);

  // 2. Estado do Componente
  showForm = signal(false);
  selectedOS = signal<OrderService | null>(null);
  statusFilter = this.osStore.statusFilter;

  // 3. Busca de Técnicos (Transforma o Observable em Signal para o computed)
  private technicians = toSignal(this.techService.getAll(), {
    initialValue: [] as Technician[],
  });

  // 4. Lógica de Negócio Reativa (Ordenação + Join de Nomes)
  readonly filteredOrders = computed(() => {
    const filter = this.statusFilter();
    const techs = this.technicians();

    // Pegamos a lista bruta da store
    // Importante: use o nome correto do sinal na sua store (ordersSignal ou similar)
    // Se na store for public orders = signal(...), use this.osStore.orders()
    const rawOrders = (this.osStore as any).ordersSignal?.() || [];

    // Mapeamos as ordens injetando o nome do técnico "on-the-fly"
    let ordersWithNames = rawOrders.map((os: OrderService) => ({
      ...os,
      technicianName: techs.find((t) => t.id === os.technicianId)?.name || 'Não atribuído',
    }));

    // Ordenação (Mais recentes primeiro: b - a)
    ordersWithNames.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Filtro por Status
    if (filter === 'ALL') return ordersWithNames;
    return ordersWithNames.filter((os: any) => os.status === filter);
  });

  ngOnInit() {
    this.osStore.loadOrders(); // Busca os dados do backend ao iniciar
  }

  finalizeOS(os: OrderService) {
    const confirmed = confirm(
      `Deseja finalizar a O.S. ${os.osNumber}? Esta ação atualizará o estoque permanentemente.`,
    );

    if (confirmed) {
      this.osStore.finalizeOrder(os.id);
    }
  }

  /**
   * Abre o formulário para uma nova O.S.
   */
  openNewOS() {
    this.selectedOS.set(null);
    this.showForm.set(true);
  }

  /**
   * Fecha o formulário e limpa seleção
   */
  closeForm() {
    this.showForm.set(false);
    this.selectedOS.set(null);
  }

  /**
   * Abre o formulário preenchido para edição
   */
  editOS(os: OrderService) {
    this.selectedOS.set(os);
    this.showForm.set(true);
  }

  /**
   * Altera o filtro de visualização
   */
  filterBy(status: any) {
    this.osStore.statusFilter.set(status as OSStatus | 'ALL');
  }

  /**
   * Cores dinâmicas para as badges de status
   */
  getStatusClass(status: string): string {
    const baseClasses = 'border ';
    const statusMap: Record<string, string> = {
      OPEN: 'bg-blue-50 text-blue-600 border-blue-100',
      IN_PROGRESS: 'bg-amber-50 text-amber-600 border-amber-100',
      COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      CANCELLED: 'bg-slate-50 text-slate-400 border-slate-100',
    };

    return baseClasses + (statusMap[status] || 'bg-slate-50 text-slate-500 border-slate-200');
  }

  /**
   * Formatação de tempo relativo (ex: há 2 horas)
   */
  formatTimeDistance(date: string | Date): string {
    if (!date) return '---';
    const start = new Date(date).getTime();
    const now = new Date().getTime();
    const diffInMinutes = Math.floor((now - start) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  }
}
