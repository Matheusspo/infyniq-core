import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateEquipmentDto, Equipment } from '../../models/equipment.model';
import { EquipmentsStore } from '../../data-access/equipments.store';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './equipment-form.component.html',
})
export class EquipmentFormComponent {
  private fb = inject(FormBuilder);
  private readonly equipmentsStore = inject(EquipmentsStore);

  @Output() save = new EventEmitter<CreateEquipmentDto>();
  @Output() cancel = new EventEmitter<void>();
  @Input() equipmentToEdit: Equipment | null = null;

  equipmentForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    position: [''],
    brand: ['', [Validators.required]],
    model: ['', [Validators.required]],
    // 1. Mudei para opcional ou valor padrão, caso não queira preencher agora
    serialNumber: ['S/N'],
    manufactureYear: [new Date().getFullYear()],

    technicalSpecs: this.fb.group({
      // 2. IMPORTANTE: Começar com 1, pois o mínimo é 1. 0 invalida o form.
      stops: [1, [Validators.required, Validators.min(1)]],
      capacityKg: [450, [Validators.required]],
      // 3. Tornei opcional para não travar o botão caso esqueça de preencher
      capacityPersons: [6],
      speed: [1.0],
      driveType: ['GEARED', [Validators.required]],
      controlPanel: [''],
    }),

    status: ['OPERATIONAL'],
    lastPreventiveDate: [null],
    nextPreventiveDate: [null],
  });

  public readonly loading = this.equipmentsStore.loading;

  ngOnInit() {
    if (this.equipmentToEdit) {
      // O patchValue preenche todos os campos que têm o mesmo nome no Form e no Objeto
      this.equipmentForm.patchValue(this.equipmentToEdit);

      // Se você tiver um FormGroupName para technicalSpecs, faça assim:
      if (this.equipmentToEdit.technicalSpecs) {
        this.equipmentForm.get('technicalSpecs')?.patchValue(this.equipmentToEdit.technicalSpecs);
      }
    }
  }

  onSubmit() {
    if (this.equipmentForm.valid) {
      this.save.emit(this.equipmentForm.value);
    }
  }

  checkInvalidControls() {
    const invalid = [];
    const controls = this.equipmentForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) invalid.push(name);
    }

    // Verifica também dentro do grupo aninhado
    const specs = (this.equipmentForm.get('technicalSpecs') as FormGroup).controls;
    for (const name in specs) {
      if (specs[name].invalid) invalid.push('technicalSpecs.' + name);
    }

    console.log('Campos que impedem o envio:', invalid);
  }
}
