import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'clientes', // Alterado para clientes como foco inicial do MVP
        pathMatch: 'full',
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/customers/customers-container/customers-container.component').then(
            (m) => m.CustomersContainerComponent,
          ),
      },
      {
        path: 'estoque',
        loadComponent: () =>
          import('./features/estoque/estoque-list/estoque-list.component').then(
            (m) => m.EstoqueListComponent,
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'clientes',
  },
];
