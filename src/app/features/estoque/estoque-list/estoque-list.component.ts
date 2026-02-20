import { Component, LOCALE_ID, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { StockStore } from '../stock.store';
import { EstoqueFormComponent } from '../estoque-form/estoque-form.component';
import { StockItem } from '../../../core/models/stock.interfaces';
import localePt from '@angular/common/locales/pt';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute } from '@angular/router';

registerLocaleData(localePt);

@Component({
  selector: 'app-estoque-list',
  standalone: true,
  imports: [CommonModule, EstoqueFormComponent],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './estoque-list.component.html',
})
export class EstoqueListComponent implements OnInit {
  protected readonly store = inject(StockStore);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  searchTerm = signal<string>('');
  metricFilter = signal<'ALL' | 'CRITICAL'>('ALL');
  isModalOpen = signal(false);

  totalItens = computed(() => this.store.items().length);
  itensAbaixoMinimo = computed(
    () => this.store.items().filter((i) => i.currentQuantity <= i.minQuantity).length,
  );
  valorTotalEstoque = computed(() =>
    this.store.items().reduce((acc, item) => acc + item.costPrice * item.currentQuantity, 0),
  );
  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase();
    let allItems = this.store.items();

    const metric = this.metricFilter();
    if (metric === 'CRITICAL') {
      allItems = allItems.filter(i => i.currentQuantity <= i.minQuantity);
    }

    if (!term) return allItems;

    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term),
    );
  });

  ngOnInit() {
    this.store.loadAll();
    this.route.queryParams.subscribe(params => {
      if (params['filter']) {
        this.metricFilter.set(params['filter'] as any);
      } else {
        this.metricFilter.set('ALL');
      }
    });
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

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    // 3. Opcional: Se sua store tiver um método de filtro interno, use-o:
    this.store.setFilter(value);
  }

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  updateQuantity(item: any, amount: number) {
    const newQuantity = item.currentQuantity + amount;

    if (newQuantity < 0) return;

    // Criamos o objeto com a nova quantidade
    const updatedData = {
      ...item,
      currentQuantity: newQuantity,
    };

    // Passamos o ID como 1º argumento e o OBJETO como 2º argumento
    this.store.updateItem(item.id, updatedData);

    const acao = amount > 0 ? 'Entrada' : 'Saída';
    this.toast.showToast(`${acao} de ${item.name} realizada!`, 'success');
  }
}
