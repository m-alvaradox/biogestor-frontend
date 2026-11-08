import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FileSizePipe } from '../../../../shared/pipes/file-size/file-size';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { DatasetStatusBadge } from '../../components/dataset-status-badge/dataset-status-badge';
import { DatasetTypeBadge } from '../../components/dataset-type-badge/dataset-type-badge';
import { DatasetDetail } from '../../models/dataset';
import { DatasetService, deleteErrorMessage } from '../../services/dataset';

@Component({
  imports: [
    DatePipe,
    RouterLink,
    FileSizePipe,
    ConfirmDialog,
    DatasetStatusBadge,
    DatasetTypeBadge,
  ],
  selector: 'app-dataset-detail',
  styleUrl: './dataset-detail.scss',
  templateUrl: './dataset-detail.html',
})
export class DatasetDetailPage implements OnInit {
  private readonly datasetService = inject(DatasetService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly updatedDataset: string | undefined =
    this.router.currentNavigation()?.extras.state?.['updatedDataset'];

  readonly dataset = signal<DatasetDetail | null>(null);
  readonly loading = signal(false);
  readonly notFound = signal(false);
  readonly error = signal('');
  readonly confirmingDelete = signal(false);
  readonly deleting = signal(false);
  readonly deleteError = signal('');

  readonly typeMetadata = computed(() =>
    Object.entries(this.dataset()?.type_metadata ?? {}).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    })),
  );

  ngOnInit(): void {
    this.load();
  }

  askDelete(): void {
    this.deleteError.set('');
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    const dataset = this.dataset();

    if (!dataset) {
      return;
    }

    const leave = () =>
      void this.router.navigate(['/datasets'], { state: { deletedDataset: dataset.name } });

    this.deleting.set(true);
    this.deleteError.set('');

    this.datasetService.delete(dataset.id).subscribe({
      next: leave,
      error: (response: HttpErrorResponse) => {
        this.deleting.set(false);
        if (response.status === 404) {
          leave();
        } else {
          this.deleteError.set(deleteErrorMessage(response));
        }
      },
    });
  }

  load(): void {
    const id = Number(this.id());

    this.error.set('');
    this.notFound.set(false);

    if (!Number.isInteger(id) || id <= 0) {
      this.notFound.set(true);
      return;
    }

    this.loading.set(true);

    this.datasetService.get(id).subscribe({
      next: (dataset) => {
        this.dataset.set(dataset);
        this.loading.set(false);
      },
      error: (response: HttpErrorResponse) => {
        if (response.status === 404) {
          this.notFound.set(true);
        } else {
          this.error.set('No se pudo cargar el dataset.');
        }
        this.loading.set(false);
      },
    });
  }
}
