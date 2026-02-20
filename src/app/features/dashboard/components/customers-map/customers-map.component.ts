import {
  Component,
  input,
  inject,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  OnDestroy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { Customer } from '../../../customers/models/customer.model';
import { GeocodingService } from '../../../../core/services/geocoding.service';
import { Subscription } from 'rxjs';

// Fix para o ícone padrão do Leaflet quebrado em builds com webpack/esbuild
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

const BLUE_ICON = L.divIcon({
  html: `<div class="custom-marker-pin"></div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

@Component({
  selector: 'app-customers-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers-map.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .map-container {
      width: 100%;
      height: 100%;
    }
  `],
})
export class CustomersMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  customers = input<Customer[]>([]);

  private readonly geocodingService = inject(GeocodingService);

  map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private geocodeSub?: Subscription;
  private resizeObserver?: ResizeObserver;

  loading = signal(false);
  mappedCount = signal(0);
  totalCount = signal(0);

  constructor() {
    effect(() => {
      const list = this.customers();
      if (list.length > 0 && this.map) {
        this.updateMarkers(list);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    const list = this.customers();
    if (list.length > 0) {
      this.updateMarkers(list);
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-14.235, -51.9253], // Centro do Brasil
      zoom: 4,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(this.map);

    // ResizeObserver é a forma mais confiável: dispara quando o browser
    // realmente conhece as dimensões finais do container (após flexbox resolver).
    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private updateMarkers(customers: Customer[]): void {
    console.log(`[Map] Recebeu ${customers.length} clientes para mapear.`);
    // Limpa markers anteriores
    this.markers.forEach((m) => m.removeFrom(this.map!));
    this.markers = [];
    this.mappedCount.set(0);
    this.totalCount.set(customers.length);

    if (customers.length === 0) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    const items = customers.map((c) => ({ address: c.address, label: c.name }));

    this.geocodeSub?.unsubscribe();
    this.geocodeSub = this.geocodingService.geocodeAll(items).subscribe({
      next: (results) => {
        // Pega o último resultado adicionado
        const latest = results[results.length - 1];
        if (!latest) return;

        console.log(`[Map] Adicionando marker para: ${latest.label}`);
        const marker = L.marker([latest.lat, latest.lng], { icon: BLUE_ICON })
          .bindPopup(
            `<div style="font-family: inherit; min-width: 160px;">
               <p style="font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#64748b; margin:0 0 4px">Cliente</p>
               <p style="font-size:14px; font-weight:700; color:#1e293b; margin:0 0 6px">${latest.label}</p>
               <p style="font-size:11px; color:#94a3b8; margin:0">${latest.address}</p>
             </div>`,
          )
          .addTo(this.map!);

        this.markers.push(marker);
        this.mappedCount.update((n) => n + 1);

        // Ajusta bounds ao adicionar pins
        if (this.markers.length > 0) {
          const group = L.featureGroup(this.markers);
          this.map!.fitBounds(group.getBounds().pad(0.2));
        }
      },
      complete: () => {
        console.log(`[Map] Mapeamento concluído. Sucesso em ${this.mappedCount()} de ${this.totalCount()} clientes.`);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.geocodeSub?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }
}
