import { Injectable, signal, computed, effect, inject, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UIService {
  private ngZone = inject(NgZone);
  
  // Estado básico
  isSidebarExpanded = signal(true);
  isSidebarOpenMobile = signal(false);
  
  // Detecção de tamanho de tela - Prioriza media query robusta
  private mobileQuery = '(max-width: 767.98px)';
  isMobile = signal(window.matchMedia(this.mobileQuery).matches);

  constructor() {
    const media = window.matchMedia(this.mobileQuery);
    
    // Listener moderno para mudanças de media query
    const handler = (e: MediaQueryListEvent) => {
      this.ngZone.run(() => {
        this.isMobile.set(e.matches);
        if (!e.matches) {
          this.isSidebarOpenMobile.set(false);
        }
      });
    };

    // Suporte para navegadores mais antigos e novos
    if (media.addEventListener) {
      media.addEventListener('change', handler);
    } else {
      (media as any).addListener(handler);
    }

    effect(() => {
      console.log(`[UI] Mobile: ${this.isMobile()}, Expanded: ${this.isSidebarExpanded()}, Open: ${this.isSidebarOpenMobile()}`);
    });
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.isSidebarOpenMobile.update(v => !v);
    } else {
      this.isSidebarExpanded.update(v => !v);
    }
  }

  closeMobileSidebar() {
    this.isSidebarOpenMobile.set(false);
  }

  sidebarWidth = computed(() => {
    if (this.isMobile()) return '0px';
    return this.isSidebarExpanded() ? '256px' : '80px';
  });
}
