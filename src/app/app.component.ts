import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root', // O index.html procura por isso
  standalone: true,
  imports: [RouterOutlet], // Precisa do RouterOutlet para as rotas funcionarem
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
  public toast = inject(ToastService);
}
