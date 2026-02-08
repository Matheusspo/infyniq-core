import { Injectable, inject, signal, computed } from '@angular/core';
import { StockService } from '../../core/services/stock.service';
import { CreateStockItemDto, StockItem } from '../../core/models/stock.interfaces';

@Injectable({
  providedIn: 'root',
})
export class StockStore {
  private stockService = inject(StockService);

  // State (Signals)
  readonly items = signal<StockItem[]>([]);
  readonly loading = signal<boolean>(false);

  // Computed (Derivados do estado)
  readonly criticalItems = computed(() =>
    this.items().filter((item) => item.currentQuantity <= item.minQuantity),
  );

  readonly totalStockValue = computed(() =>
    this.items().reduce((acc, item) => acc + item.currentQuantity * item.costPrice, 0),
  );

  readonly criticalItemsCount = computed(
    () => this.items().filter((item) => item.currentQuantity <= item.minQuantity).length,
  );

  loadAll() {
    this.loading.set(true);
    this.stockService.findAll().subscribe({
      next: (data: StockItem[]) => {
        // Agora o tipo vai bater perfeitamente
        this.items.set(data);
      },
      error: (err: any) => {
        console.error('Erro ao carregar estoque da Repair Elevadores', err);
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  createItem(newItem: CreateStockItemDto) {
    this.stockService.create(newItem).subscribe({
      next: () => {
        this.loadAll(); // Recarrega a lista para mostrar o novo item
        console.log('Item criado com sucesso na Repair Elevadores!');
      },
      error: (err) => console.error('Erro ao criar item:', err),
    });
  }

  deleteItem(id: string) {
    if (confirm('Deseja realmente excluir esta peça?')) {
      this.stockService.delete(id).subscribe({
        next: () => this.loadAll(), // Recarrega a lista após deletar
        error: (err) => console.error('Erro ao deletar', err),
      });
    }
  }
}
