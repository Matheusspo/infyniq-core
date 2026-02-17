import { Component, inject, signal, Output, EventEmitter, OnInit, Input } from '@angular/core'; // CORRIGIDO: Tudo do @angular/core
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

// Imports de Serviço e Model
import { OrderServiceStore } from '../store/order-service.store';
import { CustomersService } from '../../customers/data-access/customers.service';
import { EquipmentsService } from '../../customers/data-access/equipments.service';
import { Equipment } from '../../customers/models/equipment.model';
import { Customer } from '../../customers/models/customer.model';
import { TechniciansService } from '../../technicians/data-access/technicians.service';
import { Technician } from '../../technicians/models/technician.model';
import { OrderService } from '../models/order-service.model';

@Component({
  selector: 'app-os-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './os-form.component.html',
})
export class OSFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderStore = inject(OrderServiceStore);
  private customerService = inject(CustomersService);
  private equipmentService = inject(EquipmentsService);
  private techService = inject(TechniciansService);

  @Output() close = new EventEmitter<void>();

  isEdit = signal(false);
  loading = signal(false);
  isDataReady = signal(false);

  customers = signal<Customer[]>([]);
  technicians = signal<Technician[]>([]);
  filteredEquipments = signal<Equipment[]>([]);

  private currentId?: string;
  private osToEdit: OrderService | null = null;

  @Input() set initialData(os: OrderService | null) {
    if (os) {
      this.osToEdit = os;
      this.currentId = os.id;
      this.isEdit.set(true);
      if (this.isDataReady()) {
        this.fillFormForEdit(os);
      }
    } else {
      this.osToEdit = null;
      this.currentId = undefined;
      this.isEdit.set(false);
      this.osForm.reset({ type: 'PREVENTIVE', isEmergency: false });
      this.filteredEquipments.set([]);
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
    // Carrega dependências globais
    forkJoin({
      customers: this.customerService.getCustomers(),
      technicians: this.techService.getAll(),
    }).subscribe(
      ({ customers, technicians }: { customers: Customer[]; technicians: Technician[] }) => {
        this.customers.set(customers);
        this.technicians.set(technicians);
        this.isDataReady.set(true);

        if (this.osToEdit) {
          this.fillFormForEdit(this.osToEdit);
        }
      },
    );

    // Monitora mudança de cliente (somente manual)
    this.osForm.get('customerId')?.valueChanges.subscribe((customerId: any) => {
      if (customerId && !this.loading()) {
        this.loadEquipments(customerId.toString());
      }
    });
  }

  private loadEquipments(customerId: string) {
    this.equipmentService.getByCustomer(customerId).subscribe((equipments: Equipment[]) => {
      this.filteredEquipments.set(equipments);
    });
  }
  onSubmit() {
    if (this.osForm.invalid) return;
    this.loading.set(true);

    const formValue = this.osForm.getRawValue();

    // 1. DADOS LIMPOS: Apenas IDs e informações de serviço
    // Removemos customerName, equipmentName e technicianName daqui
    const cleanData = {
      type: formValue.type,
      isEmergency: formValue.isEmergency,
      description: formValue.description,
      customerId: formValue.customerId,
      equipmentId: formValue.equipmentId,
      technicianId: formValue.technicianId,
      updatedBy: 'Admin Henrique', // OBRIGATÓRIO pelo seu backend
    };

    if (this.isEdit()) {
      // 2. NA EDIÇÃO (PATCH/PUT)
      const updatePayload = {
        ...cleanData,
        id: this.currentId,
      };
      this.orderStore.updateOrder(updatePayload as any);
    } else {
      // 3. NA CRIAÇÃO (POST)
      // Enviamos apenas o cleanData.
      // O backend gerará id, createdAt, updatedAt e status automaticamente.
      this.orderStore.addOrder(cleanData as any);
    }

    setTimeout(() => {
      this.loading.set(false);
      this.onClose();
    }, 500);
  }
  // Métodos onClose e onSubmit permanecem os mesmos...
  onClose() {
    this.close.emit();
  }

  private fillFormForEdit(os: any) {
    const extractId = (val: any) => {
      if (!val) return '';
      if (typeof val === 'object') return val.id || val._id || '';
      return val;
    };

    let cId = extractId(os.customerId);
    let tId = extractId(os.technicianId);
    let eId = extractId(os.equipmentId);

    // LOGICA DE EMERGÊNCIA: Se o ID for "1" e não existir na lista,
    // pega o ID do primeiro cliente real para o campo não ficar vazio
    const clienteExiste = this.customers().some((c) => c.id === cId);
    if (!clienteExiste && this.customers().length > 0) {
      console.warn('ID "1" não encontrado. Usando ID do primeiro cliente da lista para teste.');
      cId = this.customers()[0].id;
    }

    this.equipmentService.getByCustomer(cId).subscribe((equipments: Equipment[]) => {
      this.filteredEquipments.set(equipments);

      setTimeout(() => {
        this.osForm.patchValue(
          {
            type: os.type,
            isEmergency: os.isEmergency,
            description: os.description,
            customerId: cId,
            technicianId: tId,
            equipmentId: eId,
          },
          { emitEvent: false },
        );
      }, 200);
    });
  }

  compareFn(item1: any, item2: any): boolean {
    // Se os dois existirem, comparamos como string para evitar erro de tipo (String vs Number)
    return item1 && item2 ? item1.toString() === item2.toString() : item1 === item2;
  }
}
