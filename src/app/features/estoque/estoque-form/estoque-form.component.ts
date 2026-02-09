import { Component, inject, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockStore } from '../stock.store';

@Component({
  selector: 'app-estoque-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './estoque-form.component.html',
})
export class EstoqueFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  protected store = inject(StockStore);
  private cd = inject(ChangeDetectorRef);

  // 🟢 IMPORTANTE: O nome aqui deve ser 'close' para bater com o seu HTML (close.emit)
  @Output() close = new EventEmitter<void>();

  stockForm: FormGroup;
  imagePreview: string | null = null;
  isEditMode = false;

  constructor() {
    this.stockForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      category: ['', Validators.required],
      currentQuantity: [0, [Validators.required, Validators.min(0)]],
      minQuantity: [0, [Validators.required, Validators.min(0)]],
      unit: ['un', Validators.required],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      location: [''],
      description: [''],
      imageUrl: [''],
    });
  }

  ngOnInit() {
    const itemToEdit = this.store.selectedItem();
    if (itemToEdit) {
      this.isEditMode = true;
      // setTimeout evita o erro de 'ExpressionChangedAfterItHasBeenChecked'
      setTimeout(() => {
        this.stockForm.patchValue(itemToEdit);
        this.imagePreview = itemToEdit.imageUrl || null;
      });
    }
  }

  // 🟢 ESSA FUNÇÃO RESOLVE O ERRO DO (change)
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.stockForm.patchValue({ imageUrl: base64String });
        this.imagePreview = base64String;
        this.cd.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  // 🟢 ESSA FUNÇÃO RESOLVE O ERRO DO (click)="removeImage()"
  removeImage() {
    this.imagePreview = null;
    this.stockForm.patchValue({ imageUrl: '' });
  }

  onSubmit() {
    if (this.stockForm.valid) {
      const formData = this.stockForm.value;
      const selectedItem = this.store.selectedItem();

      if (this.isEditMode && selectedItem) {
        this.store.updateItem(selectedItem.id, formData);
      } else {
        this.store.createItem(formData);
      }

      this.close.emit();

      this.stockForm.reset();
      this.imagePreview = null;
    }
  }
}
