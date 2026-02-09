import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root', // O index.html procura por isso
  standalone: true,
  imports: [RouterOutlet, CommonModule], // Precisa do RouterOutlet para as rotas funcionarem
  templateUrl: './app.component.html',
})
export class AppComponent {
  public toast = inject(ToastService);
}
