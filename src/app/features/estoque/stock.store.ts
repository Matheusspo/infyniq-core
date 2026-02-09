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

  readonly selectedCategory = signal<string>('Todas');

  readonly selectedItem = signal<StockItem | null>(null);

  readonly filteredItems = computed(() => {
    const query = this.filterText().toLowerCase();
    return this.items().filter(
      (item) => item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query),
    );
  });

  readonly categories = computed(() => {
    const cats = this.items().map((i) => i.category);
    return ['Todas', ...new Set(cats)];
  });

  readonly filterText = signal<string>('');

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
      next: (createdItem: StockItem) => {
        this.items.update((currentItems) => [...currentItems, createdItem]);
        console.log('Item criado com sucesso!');
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

  updateItem(id: string, changes: Partial<CreateStockItemDto>) {
    this.stockService.update(id, changes).subscribe({
      next: () => {
        this.loadAll(); // Atualiza a lista
        this.selectedItem.set(null); // Limpa a seleção
        // O fechamento do modal será controlado pelo componente
      },
      error: (err) => alert('Erro ao atualizar: ' + err.message),
    });
  }

  setFilter(text: string) {
    this.filterText.set(text);
  }
}
