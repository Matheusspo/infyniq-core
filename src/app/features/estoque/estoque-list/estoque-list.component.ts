import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { StockStore } from '../stock.store';
import { EstoqueFormComponent } from '../estoque-form/estoque-form.component';
import { StockItem } from '../../../core/models/stock.interfaces';

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, EstoqueFormComponent],
  templateUrl: './estoque-list.component.html',
})
export class EstoqueListComponent implements OnInit {
  protected readonly store = inject(StockStore);

  isModalOpen = signal(false);

  ngOnInit() {
    this.store.loadAll();
  }

  openModal(item?: StockItem) {
    // 🟢 O PULO DO GATO: Enviamos o item para o STORE
    // É de lá que o estoque-form vai ler os dados
    this.store.selectedItem.set(item || null);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    // Limpa a seleção ao fechar para não abrir o lixo na próxima vez
    this.store.selectedItem.set(null);
  }
}
