import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { UIService } from '../../services/ui.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-slate-50 relative overflow-x-hidden">
      <!-- Sidebar Mobile Backdrop -->
      @if (ui.isMobile() && ui.isSidebarOpenMobile()) {
        <div 
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[40] animate-in fade-in duration-300"
          (click)="ui.closeMobileSidebar()"
        ></div>
      }

      <app-sidebar />

      <div class="flex-1 flex flex-col transition-all duration-300 min-w-0">
        <app-header />

        <main class="mt-16 p-4 md:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  protected readonly ui = inject(UIService);
}
