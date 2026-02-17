import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'clientes',
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
        path: 'orders', // Rota que configuramos no Sidebar
        loadComponent: () =>
          import('./features/orders/os-list/os-list.component').then((m) => m.OSListComponent),
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
      {
        path: 'technicians',
        loadComponent: () =>
          import('./features/technicians/technician-list/technician-list.component').then(
            (m) => m.TechnicianListComponent,
          ),
        title: 'Infyniq - Equipe Técnica',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'clientes',
  },
];
