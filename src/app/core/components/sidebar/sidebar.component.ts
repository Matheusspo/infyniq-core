import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="w-64 bg-[#0a0f1c] h-screen flex flex-col border-r border-slate-800">
      <div class="p-6 flex flex-col items-center border-b border-slate-800/50">
        <div class="relative w-16 h-16 mb-2 flex items-center justify-center">
          <img
            src="logo-infyniq-icon.png"
            alt="Infiniq Logo"
            class="w-full h-auto object-contain"
          />
        </div>

        <h2 class="text-white font-bold text-lg tracking-[0.15em]">INFYNIQ</h2>

        <p class="text-[9px] text-blue-400/70 uppercase tracking-[0.2em] font-medium">
          Tecnologia sem limites
        </p>
      </div>

      <nav class="flex-1 mt-6 px-4 space-y-2">
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-blue-600 text-white"
          class="flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
            />
          </svg>
          <span class="font-medium">Dashboard</span>
        </a>

        <a
          routerLink="/estoque"
          routerLinkActive="bg-blue-600 text-white"
          class="flex items-center gap-3 p-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            />
          </svg>
          <span class="font-medium">Estoque</span>
        </a>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {}
