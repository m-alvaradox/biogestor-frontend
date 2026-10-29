import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Dataset, DatasetStatus, DatasetType } from '../../models/dataset';
import { DatasetService } from '../../services/dataset';

@Component({
  imports: [DatePipe],
  selector: 'app-dataset-list',
  styleUrl: './dataset-list.scss',
  templateUrl: './dataset-list.html',
})
export class DatasetList implements OnInit {
  private readonly datasetService = inject(DatasetService);

  readonly datasets = signal<Dataset[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly typeLabels: Record<DatasetType, string> = {
    audio: 'Audio',
    image: 'Imagen',
    video: 'Video',
    csv: 'CSV',
    text: 'Texto',
    other: 'Otro',
  };

  readonly statusLabels: Record<DatasetStatus, string> = {
    active: 'Activo',
    processing: 'Procesando',
    archived: 'Archivado',
    error: 'Error',
  };

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
