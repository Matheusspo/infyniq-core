import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderService, OSStatus } from '../models/order-service.model';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderServiceApiService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/service-orders'; // Ajuste se sua porta for outra

  // Busca ordens (com filtro opcional de cliente)
  getAll(customerId?: string): Observable<OrderService[]> {
    const url = customerId ? `${this.API_URL}?customerId=${customerId}` : this.API_URL;
    return this.http.get<OrderService[]>(url);
  }

  // Envia a nova O.S. para o Backend
  create(order: Partial<OrderService>): Observable<OrderService> {
    return this.http.post<OrderService>(this.API_URL, order);
  }

  // Atualiza o status (ex: para CONCLUIDA)
  updateStatus(id: string, status: OSStatus): Observable<OrderService> {
    return this.http.patch<OrderService>(`${this.API_URL}/${id}/status`, { status });
  }

  // Atualiza a O.S. completa (corpo da mensagem)
  update(id: string, order: Partial<OrderService>): Observable<OrderService> {
    // Garantimos que o ID não vá no corpo (body) para o NestJS não reclamar
    const { id: _, ...payloadWithoutId } = order as any;

    // A URL deve conter o ID: http://localhost:3000/service-orders/b211...
    return this.http.patch<OrderService>(`${this.API_URL}/${id}`, payloadWithoutId);
  }
}
