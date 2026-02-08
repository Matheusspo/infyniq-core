import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'estoque', // Mudamos para estoque pois o dashboard não existe
        pathMatch: 'full',
      },
      {
        path: 'estoque',
        loadComponent: () =>
          import('./features/estoque/estoque-list/estoque-list.component').then(
            (m) => m.EstoqueListComponent,
          ),
      },
      // Comentamos as rotas abaixo para o build passar
      /* {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'cadastro',
        loadComponent: () => import('./features/cadastro/cadastro-base/cadastro-base.component').then((m) => m.CadastroBaseComponent),
      },
      */
    ],
  },
  /*
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  */
  {
    path: '**',
    redirectTo: 'estoque',
  },
];
