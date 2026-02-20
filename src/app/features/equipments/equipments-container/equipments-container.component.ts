import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentsStore } from '../../customers/data-access/equipments.store';
import { CustomersStore } from '../../customers/data-access/customers.store';
import { EquipmentDashboardComponent } from '../../customers/components/equipment-dashboard/equipment-dashboard.component';
import { EquipmentFormComponent } from '../../customers/components/equipment-form/equipment-form.component';
import { Equipment } from '../../customers/models/equipment.model';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-equipments-container',
  standalone: true,
  imports: [CommonModule, EquipmentDashboardComponent, EquipmentFormComponent],
  template: `
    <div class="h-full relative fade-in">
      <app-equipment-dashboard
        [isStandalone]="true"
        [customerName]="'Elevadores (' + equipmentsStore.equipments().length + ')'"
        (addEquipment)="openEquipmentForm()"
        (editEquipment)="onEditEquipment($event)"
        (updateStatus)="onUpdateEquipmentStatus($event)"
      />

      <!-- Drawer Lateral para Formulários de Equipamento (O próprio form lida com fundo/drawer agora) -->
      @if (showEquipmentForm()) {
        <app-equipment-form
          [equipmentToEdit]="selectedEquipment()"
          (save)="onSaveEquipment($event)"
          (cancel)="closeEquipmentModal()"
        ></app-equipment-form>
      }
    </div>
  `,
  styles: [
    `
      .fade-in {
        animation: fadeIn 0.4s ease-out;
      }
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class EquipmentsContainerComponent implements OnInit {
  protected readonly equipmentsStore = inject(EquipmentsStore);
  protected readonly customersStore = inject(CustomersStore);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  showEquipmentForm = signal(false);
  selectedEquipment = signal<Equipment | null>(null);

  ngOnInit() {
    this.equipmentsStore.loadAll();
    this.customersStore.loadAllCustomers(); // Load customers to get customer list for new equipments

    this.route.queryParams.subscribe(params => {
      // Setup metric filters if needed
      // Currently EquipmentDashboardComponent doesn't have an input for status filter
      // But we can manually update the store's search term to filter if we had a status param
    });
  }

  openEquipmentForm() {
    this.showEquipmentForm.set(true);
  }

  onSaveEquipment(formData: any) {
    const editing = this.selectedEquipment();

    if (editing) {
      this.equipmentsStore.updateEquipment(editing.id, formData);
      this.toast.showToast('Elevador atualizado!', 'success');
    } else {
      // Quando é global, nós precisaríamos que o form tivesse um select de cliente.
      // Se não tiver, envia nulo (ou um aviso).
      // Como não adaptamos o form ainda para ter select de customer global,
      // a criação global pode ter problemas se API exigir CustomerId.
      this.equipmentsStore.addEquipment(formData);
      this.toast.showToast('Novo elevador cadastrado com sucesso!', 'success');
    }

    this.closeEquipmentModal();
  }

  onUpdateEquipmentStatus(event: {equipment: Equipment, newStatus: string}) {
    this.equipmentsStore.updateEquipment(event.equipment.id, { status: event.newStatus as any });
    this.toast.showToast(`Status do elevador atualizado para ${event.newStatus}`, 'success');
  }

  closeEquipmentModal() {
    this.showEquipmentForm.set(false);
    this.selectedEquipment.set(null);
  }

  onEditEquipment(equipment: Equipment) {
    this.selectedEquipment.set(equipment);
    this.showEquipmentForm.set(true);
  }
}
