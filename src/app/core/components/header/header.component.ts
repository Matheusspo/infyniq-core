import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header
      class="h-16 bg-white shadow-sm border-b flex items-center justify-between px-8 fixed top-0 right-0 left-0 z-10"
      [style.margin-left]="sidebarWidth()"
    >
      <h1 class="text-slate-700 font-medium">Gestão de Elevadores</h1>
      <div class="flex items-center gap-4">
        <span class="text-sm text-slate-500 italic">Unidade: São Paulo</span>
        <div class="w-8 h-8 rounded-full bg-slate-200"></div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  // Aqui poderíamos injetar um serviço para saber a largura da sidebar
  sidebarWidth = signal('256px');
}
