import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Technician } from '../models/technician.model';

@Injectable({ providedIn: 'root' })
export class TechniciansService {
  private readonly http = inject(HttpClient);
  // Ajuste a URL se o seu NestJS estiver em outra porta ou rota
  private readonly apiUrl = 'http://localhost:3000/technicians';

  /**
   * Busca todos os técnicos cadastrados
   */
  getAll(): Observable<Technician[]> {
    return this.http.get<Technician[]>(this.apiUrl);
  }

  /**
   * Busca um técnico específico pelo ID
   */
  getById(id: string): Observable<Technician> {
    return this.http.get<Technician>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo técnico
   */
  create(technician: Partial<Technician>): Observable<Technician> {
    return this.http.post<Technician>(this.apiUrl, technician);
  }

  /**
   * Atualiza os dados de um técnico existente
   */
  update(id: string, technician: Partial<Technician>): Observable<Technician> {
    return this.http.put<Technician>(`${this.apiUrl}/${id}`, technician);
  }
  /**
   * Remove um técnico do sistema
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
