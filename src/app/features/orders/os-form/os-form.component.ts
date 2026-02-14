import { Component, inject, signal, computed, effect, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-os-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './os-form.component.html',
})
export class OSFormComponent {
  private fb = inject(FormBuilder);

  @Output() close = new EventEmitter<void>();

  // Mocks de dados (Substituir pelos seus stores/services)
  customers = signal([
    { id: '1', name: 'Condomínio Solar' },
    { id: '2', name: 'Edifício Luna' },
  ]);
  allEquipments = signal([
    { id: 'e1', customerId: '1', name: 'Elevador Social 01', brand: 'Otis' },
    { id: 'e2', customerId: '1', name: 'Elevador Serviço', brand: 'Otis' },
    { id: 'e3', customerId: '2', name: 'Elevador Principal', brand: 'Atlas' },
  ]);
  technicians = signal([
    { id: 't1', name: 'João Silva' },
    { id: 't2', name: 'Ricardo Souza' },
  ]);

  osForm = this.fb.group({
    customerId: ['', Validators.required],
    equipmentId: ['', Validators.required],
    type: ['PREVENTIVE', Validators.required],
    technicianId: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  // Filtro reativo de equipamentos
  filteredEquipments = computed(() => {
    const selectedCustId = this.osForm.get('customerId')?.value;
    return this.allEquipments().filter((e) => e.customerId === selectedCustId);
  });

  constructor() {
    // Resetar o equipamento se o cliente mudar
    effect(() => {
      this.osForm.get('customerId')?.valueChanges.subscribe(() => {
        this.osForm.patchValue({ equipmentId: '' });
      });
    });
  }

  onClose() {
    this.close.emit(); // Avisa o componente pai para mudar showForm para false
  }

  onSubmit() {
    if (this.osForm.valid) {
      // Após salvar com sucesso:
      console.log('OS Salva!');
      this.onClose();
    }
  }
}
