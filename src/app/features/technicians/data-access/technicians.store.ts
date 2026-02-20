import { Injectable, inject, signal, computed } from '@angular/core';
import { TechniciansService } from './technicians.service';
import { Technician } from '../models/technician.model';
import { ToastService } from '../../../services/toast.service';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TechniciansStore {
  private readonly service = inject(TechniciansService);
  private readonly toast = inject(ToastService);

  private readonly _technicians = signal<Technician[]>([]);
  readonly loading = signal(false);

  readonly technicians = computed(() => this._technicians());

  loadAll() {
    this.loading.set(true);
    this.service
      .getAll()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this._technicians.set(data),
        error: (err) => {
          console.error('Erro ao carregar técnicos:', err);
          this.toast.showToast('Erro ao carregar lista de técnicos', 'error');
        },
      });
  }

  addTechnician(data: Partial<Technician>) {
    this.loading.set(true);
    this.service.create(data).subscribe({
      next: (newTech) => {
        this._technicians.update((all) => [...all, newTech]);
        this.toast.showToast(`${newTech.name} cadastrado!`, 'success');
      },
      error: (err) => this.toast.showToast('Erro ao salvar técnico', 'error'),
      complete: () => this.loading.set(false),
    });
  }

  updateTechnician(id: string, data: Partial<Technician>) {
    this.loading.set(true);
    this.service
      .update(id, data)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updated) => {
          this._technicians.update((list) =>
            list.map((t) => (t.id === id ? { ...t, ...updated } : t)),
          );
          this.toast.showToast('Técnico atualizado!', 'success');
        },
        error: (err) => this.toast.showToast('Erro ao atualizar técnico', 'error'),
      });
  }

  deleteTechnician(id: string) {
    this.loading.set(true);
    this.service
      .delete(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this._technicians.update((list) => list.filter((t) => t.id !== id));
          this.toast.showToast('Técnico removido!', 'success');
        },
        error: (err) => this.toast.showToast('Erro ao remover técnico', 'error'),
      });
  }
}
