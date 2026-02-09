import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { StockStore } from '../estoque/stock.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  readonly store = inject(StockStore);

  constructor() {
    this.store.loadAll();
  }

  // Calcula a porcentagem de itens que estão com estoque saudável
  getPercentage(): number {
    const total = this.store.items().length;
    if (total === 0) return 0;

    const critical = this.store.criticalItemsCount();
    const healthy = total - critical;

    return Math.round((healthy / total) * 100);
  }
}
