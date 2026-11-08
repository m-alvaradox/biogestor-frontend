import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { DatasetStatusBadge } from '../../components/dataset-status-badge/dataset-status-badge';
import { DatasetTypeBadge } from '../../components/dataset-type-badge/dataset-type-badge';
import { Dataset } from '../../models/dataset';
import { DatasetService, deleteErrorMessage } from '../../services/dataset';

@Component({
  imports: [DatePipe, RouterLink, ConfirmDialog, DatasetStatusBadge, DatasetTypeBadge],
  selector: 'app-dataset-list',
  styleUrl: './dataset-list.scss',
  templateUrl: './dataset-list.html',
})
export class DatasetList implements OnInit {
  private readonly datasetService = inject(DatasetService);

  private readonly navigationState = inject(Router).currentNavigation()?.extras.state;

  readonly createdDataset: string | undefined = this.navigationState?.['createdDataset'];
  readonly deletedDataset = signal<string | undefined>(this.navigationState?.['deletedDataset']);

  readonly datasets = signal<Dataset[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly pendingDelete = signal<Dataset | null>(null);
  readonly deleting = signal(false);
  readonly deleteError = signal('');

  ngOnInit(): void {
    this.load();
  }

  askDelete(dataset: Dataset): void {
    this.deleteError.set('');
    this.pendingDelete.set(dataset);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  confirmDelete(): void {
    const dataset = this.pendingDelete();

    if (!dataset) {
      return;
    }

    const removeRow = () => {
      this.deleting.set(false);
      this.datasets.update((datasets) => datasets.filter((item) => item.id !== dataset.id));
      this.deletedDataset.set(dataset.name);
      this.pendingDelete.set(null);
    };

    this.deleting.set(true);
    this.deleteError.set('');

    this.datasetService.delete(dataset.id).subscribe({
      next: removeRow,
      error: (response: HttpErrorResponse) => {
        if (response.status === 404) {
          removeRow();
          return;
        }
        this.deleting.set(false);
        this.deleteError.set(deleteErrorMessage(response));
      },
    });
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
