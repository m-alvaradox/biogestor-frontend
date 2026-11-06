import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatasetStatusBadge } from '../../components/dataset-status-badge/dataset-status-badge';
import { DatasetTypeBadge } from '../../components/dataset-type-badge/dataset-type-badge';
import { Dataset } from '../../models/dataset';
import { DatasetService } from '../../services/dataset';

@Component({
  imports: [DatePipe, RouterLink, DatasetStatusBadge, DatasetTypeBadge],
  selector: 'app-dataset-list',
  styleUrl: './dataset-list.scss',
  templateUrl: './dataset-list.html',
})
export class DatasetList implements OnInit {
  private readonly datasetService = inject(DatasetService);

  readonly createdDataset: string | undefined =
    inject(Router).currentNavigation()?.extras.state?.['createdDataset'];

  readonly datasets = signal<Dataset[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.datasetService.list().subscribe({
      next: (page) => {
        this.datasets.set(page.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el catálogo de datasets.');
        this.loading.set(false);
      },
    });
  }
}
