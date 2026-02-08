// No main.ts do Frontend
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // Verifique se este ficheiro existe

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
