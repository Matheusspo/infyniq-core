import { Component, inject, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockStore } from '../stock.store';

@Component({
  selector: 'app-estoque-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './estoque-form.component.html',
})
export class EstoqueFormComponent {
  private fb = inject(NonNullableFormBuilder);
  protected store = inject(StockStore);

  close = output<void>();

  stockForm = this.fb.group({
    name: ['', [Validators.required]],
    code: ['', [Validators.required]], // Match com DTO 'code'
    category: ['Peças', [Validators.required]],
    currentQuantity: [0, [Validators.required, Validators.min(0)]],
    minQuantity: [5, [Validators.required, Validators.min(0)]],
    unit: ['un', [Validators.required]], // Match com DTO 'unit'
    costPrice: [0, [Validators.required, Validators.min(0)]], // Match com DTO 'costPrice'
    location: [''],
    description: [''],
  });

  onSubmit() {
    if (this.stockForm.valid) {
      // getRawValue() envia o objeto pronto para o NestJS
      this.store.createItem(this.stockForm.getRawValue());
      this.close.emit();
    }
  }
}
