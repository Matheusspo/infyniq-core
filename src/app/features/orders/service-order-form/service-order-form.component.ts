import {
  Component,
  inject,
  signal,
  Output,
  EventEmitter,
  OnInit,
  Input,
  NgZone,
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { OrderServiceStore } from '../store/order-service.store';
import { CustomersService } from '../../customers/data-access/customers.service';
import { EquipmentsService } from '../../customers/data-access/equipments.service';
import { TechniciansService } from '../../technicians/data-access/technicians.service';
import { OrderService } from '../../../features/orders/models/order-service.model';
import { StockStore } from '../../estoque/stock.store';

import { SignaturePadComponent } from '../../../shared/components/signature-pad/signature-pad.component';

@Component({
  selector: 'app-os-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, SignaturePadComponent],
  templateUrl: './service-order-form.component.html',
})
export class OSFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderStore = inject(OrderServiceStore);
  private customerService = inject(CustomersService);
  private equipmentService = inject(EquipmentsService);
  private techService = inject(TechniciansService);
  protected stockStore = inject(StockStore);
  private ngZone = inject(NgZone);

  @Output() close = new EventEmitter<void>();

  isEdit = signal(false);
  loading = signal(false);
  isDataReady = signal(false);

  // Signals que alimentam os selects do HTML
  customers = signal<any[]>([]);
  technicians = signal<any[]>([]);
  filteredEquipments = signal<any[]>([]);
  selectedParts = signal<any[]>([]);
  customerSignature = signal<string | null>(null);

  private currentId?: string;
  private osToEdit: OrderService | null = null;

  @Input() set initialData(os: OrderService | null) {
    if (os) {
      this.osToEdit = os;
      this.currentId = os.id;
      this.isEdit.set(true);
      this.selectedParts.set(os.parts || []);
      this.customerSignature.set(os.customerSignature || null);

      // Se os dados já estão prontos, preenche agora
      // Senão, será preenchido no ngOnInit quando os dados chegarem
      if (this.isDataReady()) {
        this.loadAndFillEquipments(os);
      }
    } else {
      this.osToEdit = null;
      this.currentId = undefined;
      this.isEdit.set(false);
      this.selectedParts.set([]);
      this.customerSignature.set(null);
      // Apenas limpa quando não há dados, evitando reset desnecessário
      if (!this.osForm.pristine) {
        this.osForm.reset({ type: 'PREVENTIVE', isEmergency: false });
      }
    }
  }

  osForm = this.fb.group({
    customerId: ['', Validators.required],
    equipmentId: ['', Validators.required],
    type: ['PREVENTIVE', Validators.required],
    technicianId: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    isEmergency: [false],
  });

  ngOnInit() {
    this.stockStore.loadAll();

    // 1. CARREGAMENTO INICIAL: Garante que os dados venham do banco
    forkJoin({
      customers: this.customerService.getCustomers(),
      technicians: this.techService.getAll(),
    }).subscribe({
      next: ({ customers, technicians }) => {
        this.customers.set(customers);
        this.technicians.set(technicians);
        this.isDataReady.set(true);

        // Se for edição, carrega equipamentos e preenche agora que os dados chegaram
        if (this.osToEdit) {
          this.loadAndFillEquipments(this.osToEdit);
        }
      },
      error: (err) => console.error('Erro ao carregar dados do formulário:', err),
    });

    // 2. REATIVIDADE: Quando mudar o cliente, busca os equipamentos dele
    this.osForm.get('customerId')?.valueChanges.subscribe((cId) => {
      if (cId && !this.isEdit()) {
        // Apenas busca equipamentos se NÃO estiver em modo edição (para evitar sobrescrever)
        this.equipmentService.getByCustomer(cId).subscribe((eqs) => {
          this.filteredEquipments.set(eqs);
        });
      }
    });
  }

  // Carrega equipamentos e depois preenche o formulário
  private loadAndFillEquipments(os: OrderService) {
    const customerId = (os.customerId as any)?.id || (os.customerId as string);

    if (!customerId) {
      this.fillFormForEdit(os);
      return;
    }

    this.equipmentService.getByCustomer(customerId).subscribe({
      next: (equipments) => {
        this.filteredEquipments.set(equipments);
        // Agora que os equipamentos estão carregados, preenche o formulário
        this.fillFormForEdit(os);
      },
      error: (err) => {
        console.error('Erro ao carregar equipamentos:', err);
        // Tenta preencher mesmo com erro
        this.fillFormForEdit(os);
      },
    });
  }

  addPart(event: any) {
    const partId = event.target.value;
    if (!partId) return;
    const item = this.stockStore.items().find((p) => p.id === partId);
    if (item) {
      this.selectedParts.update((prev) => {
        if (prev.find((p) => p.id === item.id)) return prev;
        return [...prev, { id: item.id, name: item.name, requestedQuantity: 1 }];
      });
    }
    event.target.value = '';
  }

  removePart(id: string) {
    this.selectedParts.update((prev) => prev.filter((p) => p.id !== id));
  }

  updatePartQuantity(id: string, delta: number) {
    this.selectedParts.update((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(1, (p.requestedQuantity || 1) + delta);
          return { ...p, requestedQuantity: newQty };
        }
        return p;
      }),
    );
  }

  onSubmit() {
    if (this.osForm.invalid) return;
    this.loading.set(true);
    const data = {
      ...this.osForm.getRawValue(),
      parts: this.selectedParts(),
      customerSignature: this.customerSignature(),
      updatedBy: 'Henrique (Admin)',
    };

    if (this.isEdit()) this.orderStore.updateOrder({ ...data, id: this.currentId });
    else this.orderStore.addOrder(data);

    setTimeout(() => {
      this.loading.set(false);
      this.onClose();
    }, 500);
  }

  onClose() {
    this.close.emit();
  }

  compareFn(item1: any, item2: any): boolean {
    return item1 && item2 ? item1.toString() === item2.toString() : item1 === item2;
  }

  private fillFormForEdit(os: any) {
    // Usa patchValue sem emitir eventos para evitar race conditions
    // Os equipamentos já estão carregados em filteredEquipments
    this.osForm.patchValue(
      {
        type: os.type,
        isEmergency: os.isEmergency,
        description: os.description,
        customerId: os.customerId?.id || os.customerId,
        technicianId: os.technicianId?.id || os.technicianId,
        equipmentId: os.equipmentId?.id || os.equipmentId,
      },
      { emitEvent: false },
    );
  }
}
