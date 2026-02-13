import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective, CommonModule],
  templateUrl: './customer-form.component.html',
  providers: [provideNgxMask()],
})
export class CustomerFormComponent {
  private fb = new FormBuilder();

  // Os eventos que o Container vai "escutar"
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    document: ['', [Validators.required]], // CNPJ
    contactName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: [''],
    email: ['', [Validators.email]],
  });

  onSubmit() {
    if (this.customerForm.valid) {
      this.save.emit(this.customerForm.value);
      this.customerForm.reset();
    }
  }

  close() {
    // Avisa o Container para fechar o overlay
    this.cancel.emit();
  }
}
