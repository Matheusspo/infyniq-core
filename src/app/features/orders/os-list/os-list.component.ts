// ... outras importações
import { Component, inject, signal } from '@angular/core';
import { OSFormComponent } from '../os-form/os-form.component'; // ajuste o caminho
import { CommonModule } from '@angular/common';
import { OSStore } from '../store/order-service.store';

@Component({
  selector: 'app-os-list',
  standalone: true,
  imports: [CommonModule, OSFormComponent], // Adicione o formulário aqui
  templateUrl: './os-list.component.html',
})
export class OSListComponent {
  private osStore = inject(OSStore);

  filteredOrders = this.osStore.filteredOrders;
  statusFilter = this.osStore.statusFilter;
  showForm = signal(false);

  filterBy(status: string) {
    this.osStore.statusFilter.set(status);
  }

  openNewOS() {
    this.showForm.set(true);
  }

  // Função para fechar vinda do componente filho
  closeForm() {
    this.showForm.set(false);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      OPEN: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      IN_PROGRESS: 'bg-blue-50 text-blue-600 border-blue-100',
      PENDING_PARTS: 'bg-amber-50 text-amber-600 border-amber-100',
      COMPLETED: 'bg-slate-100 text-slate-400 border-slate-200',
    };
    return classes[status] || 'bg-slate-50';
  }
}
