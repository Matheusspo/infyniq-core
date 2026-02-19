import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxMaskDirective, CommonModule],
  templateUrl: './customer-form.component.html',
  providers: [provideNgxMask()],
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  // Se vier preenchido, é EDIÇÃO. Se null, é CRIAÇÃO.
  @Input() customerToEdit: Customer | null = null;

  @Output() save = new EventEmitter<Partial<Customer>>();
  @Output() cancel = new EventEmitter<void>();

  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    document: ['', [Validators.required]], // CNPJ
    contactName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    phone: [''],
    email: ['', [Validators.email]],
  });

  ngOnInit() {
    if (this.customerToEdit) {
      this.customerForm.patchValue(this.customerToEdit);
    }
  }

  onSubmit() {
    if (this.customerForm.valid) {
      const formValue = this.customerForm.value;

      // Se estiver editando, mantém o ID original
      const payload = this.customerToEdit
        ? { ...formValue, id: this.customerToEdit.id }
        : formValue;

      this.save.emit(payload);
      this.customerForm.reset();
    }
  }

  close() {
    this.cancel.emit();
  }
}
