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
import { OrderServiceStore } from '../../../orders/store/order-service.store';
import { Subscription } from 'rxjs';

// Ícones Customizados com CSS Tailwind para os Pinos Operacionais
const createIcon = (colorClass: string, isEmergency = false) => L.divIcon({
  html: `<div class="relative">
          ${isEmergency ? `<div class="absolute -inset-2 bg-rose-500/30 rounded-full animate-ping"></div>` : ''}
          <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg ${colorClass}"></div>
         </div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

const ICON_STABLE = createIcon('bg-blue-500');         // Azul: Tudo OK
const ICON_PENDING = createIcon('bg-amber-500');       // Amarelo: O.S. aberta
const ICON_EMERGENCY = createIcon('bg-rose-600', true); // Vermelho: Emergência aberta

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
  protected readonly osStore = inject(OrderServiceStore);

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

    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize();
    });
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private updateMarkers(customers: Customer[]): void {
    console.log(`[Map] Recebeu ${customers.length} clientes para mapear.`);
    this.markers.forEach((m) => m.removeFrom(this.map!));
    this.markers = [];
    this.mappedCount.set(0);
    this.totalCount.set(customers.length);

    if (customers.length === 0) {
      this.loading.set(false);
      return;
    }

    const alreadyGeocoded = customers.filter(c => c.lat !== undefined && c.lng !== undefined);
    const needsGeocoding = customers.filter(c => c.lat === undefined || c.lng === undefined);

    alreadyGeocoded.forEach(c => {
      this.addMarker(c.lat!, c.lng!, c);
      this.mappedCount.update(n => n + 1);
    });

    if (this.markers.length > 0) {
      const group = L.featureGroup(this.markers);
      this.map!.fitBounds(group.getBounds().pad(0.2));
    }

    if (needsGeocoding.length === 0) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    const itemsToGeocode = needsGeocoding.map((c) => ({ address: c.address, label: c.name, customer: c }));

    this.geocodeSub?.unsubscribe();
    this.geocodeSub = this.geocodingService.geocodeAll(itemsToGeocode).subscribe({
      next: (results) => {
        const latestResult = results[results.length - 1] as any;
        if (!latestResult) return;

        // Recupera o cliente original para determinar o status
        const originalCustomer = needsGeocoding.find(c => c.name === latestResult.label);
        if (originalCustomer) {
          this.addMarker(latestResult.lat, latestResult.lng, originalCustomer);
          this.mappedCount.update((n) => n + 1);
        }

        const group = L.featureGroup(this.markers);
        this.map!.fitBounds(group.getBounds().pad(0.2));
      },
      complete: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private addMarker(lat: number, lng: number, customer: Customer): void {
    const status = this.getCustomerStatus(customer.id);
    let icon = ICON_STABLE;
    let label = 'Estável';
    let color = 'text-blue-500';

    if (status === 'emergency') {
      icon = ICON_EMERGENCY;
      label = 'EMERGÊNCIA';
      color = 'text-rose-600 animate-pulse';
    } else if (status === 'pending') {
      icon = ICON_PENDING;
      label = 'Manutenção';
      color = 'text-amber-500';
    }

    const marker = L.marker([lat, lng], { icon })
      .bindPopup(
        `<div style="font-family: inherit; min-width: 180px;">
           <div class="flex items-center justify-between mb-2">
             <p style="font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:0.1em; color:#64748b; margin:0">Status</p>
             <span class="text-[9px] font-black uppercase ${color}">${label}</span>
           </div>
           <p style="font-size:14px; font-weight:700; color:#1e293b; margin:0 0 4px">${customer.name}</p>
           <p style="font-size:11px; color:#94a3b8; margin:0">${customer.address}</p>
         </div>`,
      )
      .addTo(this.map!);
    this.markers.push(marker);
  }

  private getCustomerStatus(customerId: string): 'stable' | 'pending' | 'emergency' {
    const orders = this.osStore.getCustomerHistory(customerId);
    const activeOrders = orders.filter(os => os.status === 'OPEN' || os.status === 'IN_PROGRESS');

    if (activeOrders.some(os => os.isEmergency)) return 'emergency';
    if (activeOrders.length > 0) return 'pending';
    return 'stable';
  }

  ngOnDestroy(): void {
    this.geocodeSub?.unsubscribe();
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }
}
