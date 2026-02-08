import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'; // Nome atualizado
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // Sem o "Experimental"
    provideRouter(routes),
    provideHttpClient(withFetch()),
  ],
};
