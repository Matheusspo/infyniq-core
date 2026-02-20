import { Component, Input, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderServiceStore } from '../../../orders/store/order-service.store';
import { CustomersStore } from '../../data-access/customers.store';
import { EquipmentsStore } from '../../data-access/equipments.store';
import { TechniciansStore } from '../../../technicians/data-access/technicians.store';
import { OrderService } from '../../../orders/models/order-service.model';

@Component({
  selector: 'app-customer-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (customer(); as c) {
      <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <!-- Dashboard de Métricas Filtrado -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- MTBF (Mean Time Between Failures) -->
          <div class="bg-slate-50 border border-slate-100 p-6 rounded-[32px] group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <i class="pi pi-history text-lg"></i>
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">MTBF Médio</span>
            </div>
            <div class="flex items-baseline gap-1">
              <h3 class="text-3xl font-black text-slate-800 tracking-tighter">
                {{ filteredMTBF() || '--' }}
              </h3>
              <span class="text-xs font-bold text-slate-400 uppercase">dias</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-2 font-medium">No período selecionado</p>
          </div>

          <!-- Volume de Atendimento -->
          <div class="bg-slate-50 border border-slate-100 p-6 rounded-[32px] group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <i class="pi pi-check-circle text-lg"></i>
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Ordens Filtradas</span>
            </div>
            <h3 class="text-3xl font-black text-slate-800 tracking-tighter">
              {{ history().length }}
            </h3>
            <p class="text-[10px] text-slate-400 mt-2 font-medium">De um total de {{ historyBase().length }}</p>
          </div>

          <!-- Time Técnico -->
          <div class="bg-slate-50 border border-slate-100 p-6 rounded-[32px] group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                <i class="pi pi-users text-lg"></i>
              </div>
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Presença Técnica</span>
            </div>
            <div class="flex flex-col gap-1">
              @if (techDist()[0]) {
                <span class="text-sm font-black text-slate-700 uppercase tracking-tighter">{{ techDist()[0].name }}</span>
                <span class="text-[10px] text-slate-400 font-bold uppercase truncate">Principal interventor</span>
              } @else {
                <span class="text-sm font-black text-slate-300 uppercase tracking-tighter">Sem dados</span>
              }
            </div>
          </div>
        </div>

        <!-- 🧪 BARRA DE FILTROS DE PRECISÃO -->
        <div class="bg-slate-50/50 border border-slate-100 p-5 rounded-[40px] flex flex-wrap items-center gap-4 shadow-sm">
          <div class="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex-1 min-w-[200px]">
            <i class="pi pi-calendar text-blue-500 text-xs text-[10px]"></i>
            <div class="flex flex-col flex-1">
              <label class="text-[8px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-1">Data Específica</label>
              <input 
                type="date" 
                [value]="dateFilter()" 
                (input)="dateFilter.set($any($event.target).value)"
                class="bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 w-full"
              />
            </div>
            @if (dateFilter()) {
              <button (click)="dateFilter.set('')" class="text-slate-300 hover:text-rose-500 transition-colors">
                <i class="pi pi-times text-[10px]"></i>
              </button>
            }
          </div>

          <div class="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex-1 min-w-[200px]">
            <i class="pi pi-user text-blue-500 text-xs text-[10px]"></i>
            <div class="flex flex-col flex-1">
              <label class="text-[8px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-1">Técnico Atendente</label>
              <select 
                [value]="techFilter()" 
                (change)="techFilter.set($any($event.target).value)"
                class="bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 w-full appearance-none cursor-pointer"
              >
                <option value="">Todos os Técnicos</option>
                @for (tech of allTechs(); track tech.id) {
                  <option [value]="tech.id">{{ tech.name }}</option>
                }
              </select>
            </div>
            <i class="pi pi-angle-down text-slate-300 text-[10px]"></i>
          </div>

          <div class="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex-1 min-w-[200px]">
            <i class="pi pi-box text-blue-500 text-xs text-[10px]"></i>
            <div class="flex flex-col flex-1">
              <label class="text-[8px] font-black uppercase tracking-tighter text-slate-400 leading-none mb-1">Equipamento/Elevador</label>
              <select 
                [value]="equipmentFilter()" 
                (change)="equipmentFilter.set($any($event.target).value)"
                class="bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 w-full appearance-none cursor-pointer"
              >
                <option value="">Todos os Equipamentos</option>
                @for (eq of availableEquipments(); track eq.id) {
                  <option [value]="eq.id">{{ eq.name }} - {{ eq.serialNumber }}</option>
                }
              </select>
            </div>
            <i class="pi pi-angle-down text-slate-300 text-[10px]"></i>
          </div>

          <button 
            (click)="dateFilter.set(''); techFilter.set(''); equipmentFilter.set('')"
            class="h-12 px-6 bg-[#1e293b] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/10"
          >
            Limpar Filtros
          </button>
        </div>

        <!-- Timeline de Eventos Técnicos -->
        <div class="bg-slate-900 rounded-[48px] border border-white/5 overflow-hidden shadow-2xl relative">
          <!-- Decorativo sutil de fundo -->
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.1),transparent)] pointer-events-none"></div>

          <div class="px-8 py-6 border-b border-white/5 bg-white/5 flex justify-between items-center relative z-10">
            <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-500">Cronologia Técnica</h4>
            <span class="text-[10px] font-bold text-slate-500 uppercase italic">Digital Technical Logbook</span>
          </div>

          <div class="p-8 relative z-10">
            <div class="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              @for (os of history(); track os.id) {
                <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <!-- Dot -->
                  <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all group-hover:scale-125 z-10"
                    [ngClass]="{
                      'bg-blue-500 shadow-blue-500/20': os.type === 'PREVENTIVE',
                      'bg-amber-500 shadow-amber-500/20': os.type === 'CORRECTIVE',
                      'bg-rose-500 shadow-rose-500/20': os.isEmergency,
                      'bg-emerald-500 shadow-emerald-500/20': os.type === 'INSTALLATION'
                    }"
                  >
                    <i class="pi text-white text-[10px]" [ngClass]="os.isEmergency ? 'pi-bolt' : 'pi-cog'"></i>
                  </div>

                  <!-- Card -->
                  <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[32px] border border-white/5 bg-white shadow-2xl transition-all group-hover:scale-[1.02] group-hover:-translate-y-1 relative">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-black text-blue-600 uppercase tracking-tighter">#{{ os.osNumber }}</span>
                      <time class="text-[10px] font-bold text-slate-400 uppercase">{{ os.createdAt | date:'dd MMM, yyyy' }}</time>
                    </div>
                    <h5 class="text-sm font-black text-slate-800 uppercase tracking-tight mb-1 truncate" [title]="os.description">{{ os.description }}</h5>
                    <div class="flex items-center gap-1.5 mb-2">
                      <i class="pi pi-box text-[8px] text-blue-500"></i>
                      <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{{ getEquipName(os) }}</span>
                    </div>
                    
                    <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <i class="pi pi-user text-[8px] text-slate-500"></i>
                        </div>
                        <span class="text-[10px] font-bold text-slate-500 uppercase truncate max-w-[80px]">
                          {{ getTechName(os) }}
                        </span>
                      </div>
                      <span [class]="getStatusClass(os.status)" class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                        {{ translateStatus(os.status) }}
                      </span>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="text-center py-10 flex flex-col items-center">
                  <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <i class="pi pi-info-circle text-slate-200 text-2xl"></i>
                  </div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem histórico disponível</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CustomerHistoryComponent implements OnInit {
  private readonly customersStore = inject(CustomersStore);
  private readonly equipmentsStore = inject(EquipmentsStore);
  private readonly techsStore = inject(TechniciansStore);
  public readonly osStore = inject(OrderServiceStore);

  readonly customer = this.customersStore.selectedCustomer;

  ngOnInit() {
    // Carrega ordens e técnicos ao inicializar a tela de histórico
    this.osStore.loadOrders();
    this.techsStore.loadAll();
  }

  // 1. Sinais de Filtro
  readonly dateFilter = signal<string>('');
  readonly techFilter = signal<string>('');
  readonly equipmentFilter = signal<string>('');

  // 2. Listas para os filtros (baseadas no histórico do cliente)
  readonly historyBase = computed(() => {
    const c = this.customer();
    return c ? this.osStore.getCustomerHistory(c.id) : [];
  });

  // Lista completa de técnicos do sistema para o filtro
  readonly allTechs = computed(() => this.techsStore.technicians());

  // Equipamentos da unidade (da equipmentsStore)
  readonly availableEquipments = computed(() => this.equipmentsStore.equipments());

  // 3. Resultado Filtrado Reativo
  readonly history = computed(() => {
    let list = this.historyBase();
    const date = this.dateFilter();
    const tech = this.techFilter();
    const eq = this.equipmentFilter();

    if (date) {
      list = list.filter((os) => {
        const osDate = new Date(os.createdAt).toISOString().split('T')[0];
        return osDate === date;
      });
    }

    if (tech) {
      list = list.filter((os) => {
        const osTechId = (os.technicianId as any)?.id || os.technicianId;
        return osTechId === tech;
      });
    }

    if (eq) {
      list = list.filter((os) => os.equipmentId === eq);
    }

    return list;
  });

  // Métricas baseadas no resultado filtrado
  readonly techDist = computed(() => {
    const list = this.history();
    const dist: Record<string, number> = {};

    list.forEach((os) => {
      const name = this.getTechName(os);
      dist[name] = (dist[name] || 0) + 1;
    });

    return Object.entries(dist)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  // Re-calculamos o MTBF para o set filtrado? 
  // Na verdade, o MTBF geralmente é uma métrica geral do ativo, 
  // mas se o usuário filtrou por um elevador específico, faz sentido mostrar o MTBF dele.
  readonly filteredMTBF = computed(() => {
    const list = this.history().filter((os) => os.type === 'CORRECTIVE' || os.isEmergency);
    if (list.length < 2) return null;

    const dates = list.map((os) => new Date(os.createdAt).getTime());
    let totalGap = 0;
    for (let i = 0; i < dates.length - 1; i++) {
      totalGap += Math.abs(dates[i] - dates[i + 1]);
    }

    const averageMs = totalGap / (dates.length - 1);
    return Math.round(averageMs / (1000 * 60 * 60 * 24));
  });

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      OPEN: 'bg-blue-50 text-blue-600',
      IN_PROGRESS: 'bg-amber-50 text-amber-600',
      COMPLETED: 'bg-emerald-50 text-emerald-600',
      CANCELLED: 'bg-slate-50 text-slate-400',
    };
    return statusMap[status] || 'bg-slate-50 text-slate-500';
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      OPEN: 'Aberto',
      IN_PROGRESS: 'Andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
    };
    return map[status] || status;
  }

  getTechName(os: OrderService): string {
    const techId = (os.technicianId as any)?.id || os.technicianId;
    if (!techId) return 'Não atribuído';
    
    // Busca na store global de técnicos
    const tech = this.techsStore.technicians().find(t => t.id === techId);
    return tech ? tech.name : 'Técnico';
  }

  getEquipName(os: OrderService): string {
    const eqId = (os.equipmentId as any)?.id || os.equipmentId;
    if (!eqId) return 'Ativo não identificado';
    
    const eq = this.equipmentsStore.equipments().find(e => e.id === eqId);
    return eq ? eq.name : 'Equipamento';
  }
}
