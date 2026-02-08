import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { StockStore } from '../stock.store';
import { EstoqueFormComponent } from '../estoque-form/estoque-form.component';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, EstoqueFormComponent],
  templateUrl: './estoque-list.component.html',
})
export class EstoqueListComponent implements OnInit {
  // Injetamos o Store que gerencia o estado do estoque
  protected readonly store = inject(StockStore);

  ngOnInit() {
    // Ao iniciar a tela, carregamos os dados do backend
    this.store.loadAll();
  }

  // No estoque-list.component.ts
  showForm = signal(false);

  toggleForm() {
    this.showForm.update((v) => !v);
  }
}
