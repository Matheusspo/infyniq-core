import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-slate-50">
      <app-sidebar />

      <div class="flex-1 flex flex-col overflow-hidden">
        <header
          class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm"
        >
          <h2 class="text-xl font-semibold text-slate-800">Sistema de Gestão</h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-500 italic">Unidade: São Paulo</span>
            <div
              class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold"
            >
              M
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AppShellComponent {}
