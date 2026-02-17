// src/app/features/technicians/technician-form/technician-form.component.ts
import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TechniciansService } from '../data-access/technicians.service';
import { ToastService } from '../../../services/toast.service';
import { Technician } from '../models/technician.model';

@Component({
  selector: 'app-technician-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './technician-form.component.html',
})
export class TechnicianFormComponent {
  private fb = inject(FormBuilder);
  private techService = inject(TechniciansService);
  private toast = inject(ToastService);

  @Input() set initialData(data: any) {
    if (data) {
      this.form.patchValue({
        ...data,
        isActive: data.isActive ?? true, // Se vier nulo do banco, assume true
      });
    }
  }
  @Output() close = new EventEmitter<void>();

  form = this.fb.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(14)]],
    specialty: ['Mecânica', Validators.required],
    isActive: [true],
  });

  // No technician-form.component.ts

  save() {
    if (this.form.invalid) return;

    const rawValue = this.form.getRawValue();
    const id = rawValue.id;

    // Criamos um payload sem o ID para enviar ao backend
    const { id: _, ...payload } = rawValue;

    const request$ = id
      ? this.techService.update(id, payload as any)
      : this.techService.create(payload as any);

    request$.subscribe({
      next: (savedTech) => {
        this.toast.showToast(id ? 'Técnico atualizado!' : 'Técnico cadastrado!', 'success');
        this.close.emit(); // Fecha a gaveta e avisa o componente pai para atualizar
      },
      error: (err) => {
        this.toast.showToast('Falha na operação técnica', 'error');
      },
    });
  }

  // Dentro da sua classe TechnicianFormComponent

  applyPhoneMask(event: any) {
    const input = event.target as HTMLInputElement;

    // Se for uma tecla de deleção (Backspace ou Delete), não aplicamos a máscara
    // imediatamente para permitir que o usuário limpe o campo livremente.
    if (event.inputType === 'deleteContentBackward' || event.inputType === 'deleteContentForward') {
      return;
    }

    let value = input.value.replace(/\D/g, ''); // Remove tudo que não é número

    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, '($1');
    }

    this.form.get('phone')?.setValue(value, { emitEvent: false });
  }

  applyEmailMask(event: any) {
    const input = event.target as HTMLInputElement;
    // Força minúsculas e remove espaços enquanto digita
    const value = input.value.toLowerCase().replace(/\s/g, '');
    this.form.get('email')?.setValue(value, { emitEvent: false });
  }
}
