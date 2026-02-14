import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../core/components/sidebar/sidebar.component';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-slate-50 overflow-hidden">
      <app-sidebar />

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-20 flex items-center justify-end px-10 z-10 transition-all">
          <div
            class="flex items-center gap-6 bg-white/40 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all group"
          >
            <div class="flex flex-col items-end border-r border-slate-200 pr-6">
              <span
                class="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mb-1"
                >Unidade Ativa</span
              >
              <span class="text-[11px] font-bold text-[#1e293b]">SÃO PAULO - MATRIZ</span>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex flex-col items-end">
                <span class="text-[11px] font-black text-slate-700 uppercase tracking-tighter"
                  >Admin</span
                >
                <span class="text-[9px] font-bold text-slate-400 leading-none">Acesso Total</span>
              </div>
              <div
                class="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-slate-900/10 group-hover:bg-blue-600 transition-colors"
              >
                M
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar px-10 pb-10">
          <div
            class="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      /* Scrollbar estilizada para manter o visual Premium */
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #cbd5e1;
      }
    `,
  ],
})
export class AppShellComponent {}
