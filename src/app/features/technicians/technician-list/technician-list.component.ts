// src/app/features/technicians/technician-list/technician-list.component.ts
import { Component, inject, signal, computed } from '@angular/core'; // Importado computed
import { CommonModule } from '@angular/common';
import { TechniciansService } from '../data-access/technicians.service';
import { Technician } from '../models/technician.model';
import { TechnicianFormComponent } from '../technician-form/technician-form.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-technician-list',
  standalone: true,
  imports: [CommonModule, TechnicianFormComponent],
  templateUrl: './technician-list.component.html',
})
export class TechnicianListComponent {
  private techService = inject(TechniciansService);
  private toast = inject(ToastService);

  // Estados
  technicians = signal<Technician[]>([]);
  searchTerm = signal(''); // Novo sinal para o termo de busca
  showForm = signal(false);
  selectedTech = signal<Technician | null>(null);

  // Lógica de Filtro Reativa (Escalabilidade)
  filteredTechnicians = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    let techs = this.technicians();

    // 1. Primeiro, filtramos pelos termos de busca (se houver)
    if (term) {
      techs = techs.filter(
        (tech) =>
          tech.name.toLowerCase().includes(term) ||
          tech.specialty.toLowerCase().includes(term) ||
          tech.email.toLowerCase().includes(term),
      );
    }

    // 2. Depois, ordenamos: Ativos no topo (true vem antes de false)
    // Em JavaScript/TypeScript, true (1) e false (0).
    // Subtraindo b - a, garantimos que 1 venha antes de 0.
    return [...techs].sort((a, b) => {
      if (a.isActive === b.isActive) {
        // Se ambos tiverem o mesmo status, ordena por nome (A-Z)
        return a.name.localeCompare(b.name);
      }
      return a.isActive ? -1 : 1;
    });
  });

  constructor() {
    this.loadTechs();
  }

  loadTechs() {
    this.techService.getAll().subscribe({
      next: (data) => this.technicians.set(data),
      error: () => this.toast.showToast('Erro ao carregar técnicos', 'error'),
    });
  }

  // Método para capturar a digitação
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  openNew() {
    this.selectedTech.set(null);
    this.showForm.set(true);
  }

  edit(tech: Technician) {
    this.selectedTech.set(tech);
    this.showForm.set(true);
  }

  toggleStatus(tech: Technician) {
    const newStatus = !tech.isActive;
    const action = newStatus ? 'ativar' : 'desativar';

    if (confirm(`Deseja realmente ${action} o técnico ${tech.name}?`)) {
      // Chamamos o método update do service passando apenas o novo status
      this.techService.update(tech.id, { isActive: newStatus }).subscribe({
        next: () => {
          // Atualiza a lista localmente para refletir a mudança no Signal
          this.technicians.update((techs) =>
            techs.map((t) => (t.id === tech.id ? { ...t, isActive: newStatus } : t)),
          );

          this.toast.showToast(
            `Técnico ${newStatus ? 'ativado' : 'desativado'} com sucesso`,
            'success',
          );
        },
        error: () => this.toast.showToast(`Erro ao ${action} técnico`, 'error'),
      });
    }
  }

  openWhatsApp(phone: string) {
    // 1. Remove tudo que não é número
    const cleanNumber = phone.replace(/\D/g, '');

    // 2. Adiciona o código do país (55 para Brasil) se não tiver
    const finalNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;

    // 3. Monta a URL e abre em nova aba
    const url = `https://wa.me/${finalNumber}`;
    window.open(url, '_blank');
  }
}
