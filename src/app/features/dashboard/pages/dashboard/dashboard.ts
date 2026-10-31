import { Component } from '@angular/core';
import { StatCard } from '../../../../shared/ui/stat-card/stat-card';
import { DashboardStat } from '../../models/dashboard-stat';

@Component({
  selector: 'app-dashboard',
  imports: [StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly stats: DashboardStat[] = [
    {
      label: 'Datasets',
      value: 42,
      description: 'Conjuntos de datos registrados',
    },
    {
      label: 'Modelos',
      value: 18,
      description: 'Modelos de aprendizaje automático',
    },
    {
      label: 'Versiones',
      value: 35,
      description: 'Versiones de modelos registradas',
    },
    {
      label: 'Experimentos',
      value: 128,
      description: 'Ejecuciones registradas',
    },
  ];
}
