import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderServiceStore } from '../store/order-service.store';
import { CustomersStore } from '../../customers/data-access/customers.store';
import { OSFormComponent } from '../service-order-form/service-order-form.component';
import { OrderService, OSStatus } from '../models/order-service.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { TechniciansService } from '../../technicians/data-access/technicians.service';
import { Technician } from '../../technicians/models/technician.model';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { ActivatedRoute } from '@angular/router';

import { PDFExportService } from '../../../core/services/pdf-export.service';

@Component({
  selector: 'app-os-list',
  standalone: true,
  imports: [CommonModule, OSFormComponent, ConfirmationModalComponent],
  templateUrl: './service-order-list.component.html',
})
export class OSListComponent implements OnInit {
  // 1. Injeção de Dependências
  public readonly osStore = inject(OrderServiceStore);
  private readonly techService = inject(TechniciansService);
  private readonly customersStore = inject(CustomersStore);
  private readonly pdfService = inject(PDFExportService);
  private readonly route = inject(ActivatedRoute);

  isDrawerOpen = signal(false);

  // 2. Estado do Componente
  showForm = signal(false);
  
  // Controle do Modal de Confirmação
  showConfirmation = signal(false);
  confirmationData = signal<{
    title: string;
    message: string;
    action: () => void;
    type: 'danger' | 'info' | 'success';
  } | null>(null);

  selectedOS = signal<OrderService | null>(null);
  
  // Filtro local, se quisermos desconectar da store, mas aqui mantemos sync
  // statusFilter = this.osStore.statusFilter; 
  searchQuery = signal('');
  metricFilter = signal<'ALL' | 'EMERGENCY' | 'TODAY' | 'PENDING'>('ALL');

  // 3. Busca de Técnicos (Transforma o Observable em Signal para o computed)
  private technicians = toSignal(this.techService.getAll(), {
    initialValue: [] as Technician[],
  });

  // 4. Lógica de Negócio Reativa (Ordenação + Join de Nomes)
  readonly filteredOrders = computed(() => {
    const filter = this.osStore.statusFilter(); // Lendo direto da store
    const query = this.searchQuery().toLowerCase().trim();
    const techs = this.technicians();
    const customers = this.customersStore.customers(); // Obtendo lista de clientes

    // Pegamos a lista bruta da store
    const rawOrders = (this.osStore as any).ordersSignal?.() || [];

    // Mapeamos as ordens injetando nomes
    let ordersWithNames = rawOrders.map((os: OrderService) => {
      const customer = customers.find(c => c.id === os.customerId);
      return {
        ...os,
        technicianName: techs.find((t) => t.id === os.technicianId)?.name || 'Não atribuído',
        customerName: customer?.name || 'Cliente não encontrado',
        customerAddress: customer?.address || '', // Preenchendo endereço também
      };
    });

    // Ordenação (Mais recentes primeiro: b - a)
    ordersWithNames.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // 1. Filtro por Status
    let result = ordersWithNames;
    if (filter !== 'ALL') {
      result = result.filter((os: any) => os.status === filter);
    }

    // 2. Filtro de Métrica (Vindo do Dashboard)
    const metric = this.metricFilter();
    if (metric === 'EMERGENCY') {
      result = result.filter((os: any) => os.isEmergency && os.status !== 'COMPLETED' && os.status !== 'CANCELLED');
    } else if (metric === 'TODAY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter((os: any) => {
        const osDate = new Date(os.createdAt);
        osDate.setHours(0, 0, 0, 0);
        return osDate.getTime() === today.getTime() && os.status !== 'CANCELLED';
      });
    } else if (metric === 'PENDING') {
      result = result.filter((os: any) => os.status === 'OPEN' || os.status === 'IN_PROGRESS');
    }

    // 3. Filtro por Texto (Search)
    if (query) {
      result = result.filter((os: any) => 
        os.customerName?.toLowerCase().includes(query) ||
        os.equipmentName?.toLowerCase().includes(query) ||
        os.osNumber?.toLowerCase().includes(query) ||
        os.description?.toLowerCase().includes(query)
      );
    }

    return result;
  });

  ngOnInit() {
    this.osStore.loadOrders(); // Busca os dados do backend ao iniciar
    this.customersStore.loadAllCustomers(); // Garante que temos os clientes para o Join
    this.route.queryParams.subscribe(params => {
      if (params['filter']) {
        this.metricFilter.set(params['filter'] as any);
      } else {
        this.metricFilter.set('ALL');
      }
    });
  }

  startAttendance(os: OrderService) {
    this.osStore.startOrder(os.id);
  }

  initiateFinalizeOS(os: OrderService) {
    this.confirmationData.set({
      title: 'Finalizar O.S.?',
      message: `Deseja finalizar a O.S. #${os.osNumber}? Esta ação irá baixar o estoque utilizado e marcar o serviço como concluído.`,
      type: 'success', // ou 'info', mas success faz sentido para concluir
      action: () => {
        this.osStore.finalizeOrder(os.id);
        this.closeConfirmation();
      }
    });
    this.showConfirmation.set(true);
  }

  onConfirmAction() {
    const data = this.confirmationData();
    if (data && data.action) {
      data.action();
    }
  }

  closeConfirmation() {
    this.showConfirmation.set(false);
    this.confirmationData.set(null);
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

  exportToPDF(os: OrderService) {
    this.pdfService.generateOSReport(os);
  }

  /**
   * Abre o formulário preenchido para edição
   */
  editOS(os: OrderService) {
    this.selectedOS.set(os);
    this.showForm.set(true);
  }

  /**
   * Atualiza o termo de busca
   */
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
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
  translateStatus(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'Aberto',
      IN_PROGRESS: 'Em Andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      ALL: 'Todas'
    };
    return map[status] || status;
  }

  translateType(type: string): string {
    const map: Record<string, string> = {
      PREVENTIVE: 'Preventiva',
      CORRECTIVE: 'Corretiva',
      EMERGENCY: 'Emergência',
      INSTALLATION: 'Instalação'
    };
    return map[type] || type;
  }
}
