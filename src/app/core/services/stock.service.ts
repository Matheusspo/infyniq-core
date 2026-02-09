// 1. O Injectable e o inject vêm do @angular/core
import { Injectable, inject } from '@angular/core';

// 2. O HttpClient e outros utilitários de rede vêm do @angular/common/http
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockItem, CreateStockItemDto } from '../models/stock.interfaces';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  // Agora o inject vai funcionar corretamente aqui
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/stock`;

  findAll(): Observable<StockItem[]> {
    return this.http.get<StockItem[]>(`${this.API_URL}/items`);
  }

  create(item: CreateStockItemDto): Observable<StockItem> {
    return this.http.post<StockItem>(`${this.API_URL}/items`, item);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/items/${id}`);
  }

  update(id: string, item: Partial<StockItem>): Observable<StockItem> {
    return this.http.put<StockItem>(`${this.API_URL}/items/${id}`, item);
  }
}
