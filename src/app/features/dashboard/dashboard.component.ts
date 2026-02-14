import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. Definimos a interface para o objeto de estatísticas
interface DashboardData {
  todayOS: number;
  pendingOS: number;
  activeTechnicians: number;
  completedMonth: number;
}

// 2. Definimos a interface para o item do KPI
interface KpiItem {
  label: string;
  key: keyof DashboardData; // Isso garante que a 'key' deve ser uma das propriedades acima
  icon: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  // Tipamos o Signal com a interface
  stats = signal<DashboardData>({
    todayOS: 12,
    pendingOS: 5,
    activeTechnicians: 8,
    completedMonth: 142,
  });

  // Tipamos a array de KPIs
  kpis: KpiItem[] = [
    {
      label: 'OS Hoje',
      key: 'todayOS',
      icon: 'check',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pendentes',
      key: 'pendingOS',
      icon: 'alert',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Em Campo',
      key: 'activeTechnicians',
      icon: 'tool',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Mês Atual',
      key: 'completedMonth',
      icon: 'chart',
      color: 'text-slate-600',
      bg: 'bg-slate-50',
    },
  ];

  weeklyDemand = signal([
    { day: 'Seg', value: 45 },
    { day: 'Ter', value: 72 },
    { day: 'Qua', value: 38 },
    { day: 'Qui', value: 90 },
    { day: 'Sex', value: 55 },
    { day: 'Sáb', value: 20 },
    { day: 'Dom', value: 10 },
  ]);

  // Função para calcular a altura da barra (normalização em %)
  getBarHeight(value: number): string {
    const max = Math.max(...this.weeklyDemand().map((d) => d.value));
    return `${(value / max) * 100}%`;
  }
}
