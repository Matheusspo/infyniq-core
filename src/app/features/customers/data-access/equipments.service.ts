// src/app/features/customers/data-access/equipments.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Equipment, CreateEquipmentDto } from '../models/equipment.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EquipmentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/equipments';

  getByCustomer(customerId: string) {
    return this.http.get<Equipment[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  create(equipment: CreateEquipmentDto) {
    // O objeto enviado aqui já contém o technicalSpecs aninhado
    return this.http.post<Equipment>(this.apiUrl, equipment);
  }

  delete(id: string): Observable<void> {
    // Apenas ${this.apiUrl}/${id} porque a apiUrl já termina em /equipments
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  update(id: string, equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, equipment);
  }
}
