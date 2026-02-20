import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, catchError, concatMap, delay, scan } from 'rxjs/operators';

export interface GeoResult {
  address: string;
  label: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, { lat: number; lng: number } | null>();

  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private readonly DELAY_MS = 1100; // respeita 1 req/s do Nominatim

  geocode(address: string): Observable<{ lat: number; lng: number } | null> {
    if (this.cache.has(address)) {
      return of(this.cache.get(address)!);
    }

    const params = {
      q: address,
      format: 'json',
      limit: '1',
    };

    const headers = {
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'User-Agent': 'InfyniqService/1.0 (Angular Client)',
    };

    return this.http
      .get<NominatimResult[]>(this.NOMINATIM_URL, { params, headers })
      .pipe(
        map((results) => {
          if (!results || results.length === 0) {
            console.warn(`[Geocoding] Nenhum resultado para: ${address}`);
            this.cache.set(address, null);
            return null;
          }
          const coords = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
          console.log(`[Geocoding] Sucesso: ${address} -> ${coords.lat}, ${coords.lng}`);
          this.cache.set(address, coords);
          return coords;
        }),
        catchError((error) => {
          console.error(`[Geocoding] Erro na requisição para: ${address}`, error);
          this.cache.set(address, null);
          return of(null);
        }),
      );
  }

  geocodeAll(
    items: { address: string; label: string }[],
  ): Observable<(GeoResult | null)[]> {
    // concatMap garante execução sequencial.
    // delay(DELAY_MS) adiciona EXATAMENTE 1.1s entre cada chamada (não multiplica pelo índice).
    return from(items).pipe(
      concatMap((item, index) =>
        (index === 0 ? of(item) : of(item).pipe(delay(this.DELAY_MS))).pipe(
          concatMap((i) => this.geocode(i.address)),
          map((coords) =>
            coords ? { ...coords, address: item.address, label: item.label } : null,
          ),
        ),
      ),
      scan(
        (acc: (GeoResult | null)[], result) => [...acc, result],
        [] as (GeoResult | null)[],
      ),
    );
  }
}
