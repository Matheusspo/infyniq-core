// src/app/features/customers/data-access/customers.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { Equipment } from '../models/equipment.model';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000'; // Ajuste conforme seu env

  // Clientes
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/customers`);
  }

  createCustomer(customer: Partial<Customer>) {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customer);
  }

  addEquipment(equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/equipments`, equipment);
  }

  getEquipmentsByCustomer(customerId: string): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.apiUrl}/equipments/customer/${customerId}`);
  }
}
