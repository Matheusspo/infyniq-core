import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderService, OSStatus } from '../models/order-service.model';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderServiceApiService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/service-orders'; // Ajuste se sua porta for outra

  // Busca todas as ordens do JSON via Backend
  getAll(): Observable<OrderService[]> {
    return this.http.get<OrderService[]>(this.API_URL);
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
    return this.http.patch<OrderService>(`${this.API_URL}/${id}`, order);
  }
}
