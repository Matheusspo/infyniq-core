import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipment } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-status-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        (click)="onCancel()"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-white"
      >
        <header class="p-8 text-center pb-6">
          <div class="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner">
             <i class="pi pi-bolt text-2xl"></i>
          </div>
          <h3 class="text-2xl font-black text-slate-800 tracking-tight mb-2">
            Alterar Status
          </h3>
          <p class="text-slate-500 font-medium text-sm">
            Selecione o novo status para o elevador <strong class="text-slate-800">{{ equipment?.name }}</strong>.
          </p>
        </header>

        <div class="px-8 pb-8 space-y-3">
          <!-- Item Operacional -->
          <button
            (click)="onSelect('OPERATIONAL')"
            class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group"
            [ngClass]="equipment?.status === 'OPERATIONAL' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-500 hover:bg-emerald-50'"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" [ngClass]="equipment?.status === 'OPERATIONAL' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'">
               <i class="pi pi-check"></i>
            </div>
            <div class="text-left">
              <span class="block text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Operacional</span>
              <span class="block text-xs font-medium text-slate-500">Funcionando normalmente</span>
            </div>
          </button>

          <!-- Item Manutenção -->
          <button
            (click)="onSelect('MAINTENANCE')"
            class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group"
            [ngClass]="equipment?.status === 'MAINTENANCE' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-amber-500 hover:bg-amber-50'"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" [ngClass]="equipment?.status === 'MAINTENANCE' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-amber-500 group-hover:text-white'">
               <i class="pi pi-wrench"></i>
            </div>
            <div class="text-left">
              <span class="block text-[11px] font-black uppercase tracking-widest text-amber-600 mb-0.5">Em Manutenção</span>
              <span class="block text-xs font-medium text-slate-500">Técnico designado no local</span>
            </div>
          </button>

          <!-- Item Parado -->
          <button
            (click)="onSelect('OUT_OF_SERVICE')"
            class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group"
            [ngClass]="equipment?.status === 'OUT_OF_SERVICE' ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-red-500 hover:bg-red-50'"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" [ngClass]="equipment?.status === 'OUT_OF_SERVICE' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-red-500 group-hover:text-white'">
               <i class="pi pi-ban"></i>
            </div>
            <div class="text-left">
              <span class="block text-[11px] font-black uppercase tracking-widest text-red-600 mb-0.5">Parado</span>
              <span class="block text-xs font-medium text-slate-500">Fora de operação temporariamente</span>
            </div>
          </button>
        </div>

        <!-- Actions -->
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button
            (click)="onCancel()"
            class="px-6 py-3 text-slate-500 font-black hover:text-slate-800 transition-colors uppercase tracking-widest text-[11px]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class EquipmentStatusModalComponent {
  @Input() equipment: Equipment | null = null;
  @Output() statusSelect = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  onSelect(status: string) {
    this.statusSelect.emit(status);
  }

  onCancel() {
    this.cancel.emit();
  }
}
