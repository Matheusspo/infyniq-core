import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIService } from '../../services/ui.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header
      class="h-16 bg-white shadow-sm border-b flex items-center justify-between px-4 md:px-8 fixed top-0 right-0 z-10 transition-all duration-300"
      [style.left]="ui.sidebarWidth()"
    >
      <div class="flex items-center gap-4">
        <!-- Botão Menu Mobile -->
        @if (ui.isMobile()) {
          <button 
            (click)="ui.toggleSidebar()"
            class="p-2 hover:bg-slate-50 rounded-xl transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
        <h1 class="text-sm md:text-base text-slate-700 font-bold uppercase tracking-tight">
          Gestão <span class="text-blue-600">Infyniq</span>
        </h1>
      </div>

      <div class="flex items-center gap-4">
        <span class="hidden md:inline text-xs text-slate-400 font-bold uppercase tracking-widest">Matriz SP</span>
        <div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-md">
          AD
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly ui = inject(UIService);
}
