import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-slate-900 text-white h-screen flex flex-col transition-all">
      <div class="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-2">
        <span class="text-blue-500">🛠️</span> Repair Elevadores
      </div>

      <nav class="flex-1 mt-6 px-4 space-y-2">
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-blue-600 text-white"
          class="flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>📊</span> Dashboard
        </a>
        <a
          routerLink="/estoque"
          routerLinkActive="bg-blue-600 text-white"
          class="flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>📦</span> Estoque
        </a>
        <a
          routerLink="/cadastro"
          routerLinkActive="bg-blue-600 text-white"
          class="flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>➕</span> Cadastros
        </a>
      </nav>

      <div class="p-4 border-t border-slate-800 text-xs text-slate-500">v1.0.0-infyniq</div>
    </aside>
  `,
})
export class SidebarComponent {}
