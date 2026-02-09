import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomersStore } from '../../data-access/customers.store';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipment-form.component.html',
})
export class EquipmentFormComponent {
  private fb = inject(FormBuilder);
  private store = inject(CustomersStore);

  // Reativo: Pega o ID do cliente que está selecionado na Store
  selectedCustomerId = this.store.selectedCustomer()?.id;

  equipmentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    brand: ['', Validators.required],
    model: [''],
    serialNumber: [''],
    technicalSpecs: this.fb.group({
      stops: [2, [Validators.required, Validators.min(1)]],
      capacityPersons: [6, Validators.required],
      driveType: ['GEARED', Validators.required],
    }),
    status: ['OPERATIONAL'],
  });

  onSubmit() {
    if (this.equipmentForm.valid) {
      const payload = {
        ...this.equipmentForm.value,
        customerId: this.selectedCustomerId,
      };

      console.log('Salvando equipamento:', payload);
      // Aqui chamaremos: this.store.addEquipment(payload);
    }
  }
}
