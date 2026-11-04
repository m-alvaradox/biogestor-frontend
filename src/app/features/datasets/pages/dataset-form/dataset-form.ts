import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DATASET_STATUS_LABELS, DATASET_TYPE_LABELS } from '../../models/dataset-labels';
import { DatasetCreatePayload, DatasetStatus, DatasetType } from '../../models/dataset';
import { DatasetService } from '../../services/dataset';

type FieldName =
  | 'name'
  | 'type'
  | 'status'
  | 'description'
  | 'species'
  | 'farm'
  | 'pool'
  | 'capture_date'
  | 'license'
  | 's3_uri'
  | 'file_format'
  | 'size_bytes'
  | 'file_count';

const STORAGE_FIELDS: FieldName[] = ['s3_uri', 'file_format', 'size_bytes', 'file_count'];

function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function notFutureDate(control: AbstractControl<string>): ValidationErrors | null {
  return control.value && control.value > todayIso() ? { futureDate: true } : null;
}

function nonNegativeInteger(control: AbstractControl<number | null>): ValidationErrors | null {
  const value = control.value;
  return value === null || (Number.isInteger(value) && value >= 0)
    ? null
    : { nonNegativeInteger: true };
}

function textOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-dataset-form',
  styleUrl: './dataset-form.scss',
  templateUrl: './dataset-form.html',
})
export class DatasetForm {
  private readonly datasetService = inject(DatasetService);
  private readonly router = inject(Router);

  readonly typeOptions = Object.entries(DATASET_TYPE_LABELS) as [DatasetType, string][];
  readonly statusOptions = Object.entries(DATASET_STATUS_LABELS) as [DatasetStatus, string][];
  readonly maxDate = todayIso();

  readonly saving = signal(false);
  readonly submitError = signal('');
  readonly serverErrors = signal<Partial<Record<FieldName, string>>>({});

  readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    type: ['' as DatasetType | '', Validators.required],
    status: ['active' as DatasetStatus],
    description: [''],
    species: ['', Validators.maxLength(100)],
    farm: ['', Validators.maxLength(100)],
    pool: ['', Validators.maxLength(50)],
    capture_date: ['', notFutureDate],
    license: ['', Validators.maxLength(100)],
    s3_uri: ['', Validators.maxLength(1024)],
    file_format: ['', Validators.maxLength(30)],
    size_bytes: [null as number | null, nonNegativeInteger],
    file_count: [null as number | null, nonNegativeInteger],
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      if (Object.keys(this.serverErrors()).length > 0) {
        this.serverErrors.set({});
      }
    });
  }

  errorFor(field: FieldName): string {
    const control = this.form.controls[field];
    const serverError = this.serverErrors()[field];

    if (serverError) {
      return serverError;
    }
    if (!control.invalid || !(control.touched || control.dirty)) {
      return '';
    }
    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }
    if (control.hasError('maxlength')) {
      return `Máximo ${control.getError('maxlength').requiredLength} caracteres.`;
    }
    if (control.hasError('futureDate')) {
      return 'La fecha de captura no puede ser futura.';
    }
    if (control.hasError('nonNegativeInteger')) {
      return 'Debe ser un número entero mayor o igual a 0.';
    }
    return 'Valor no válido.';
  }

  save(): void {
    this.submitError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Revisa los campos marcados antes de guardar.');
      return;
    }

    this.saving.set(true);

    this.datasetService.create(this.buildPayload()).subscribe({
      next: (dataset) => {
        this.saving.set(false);
        void this.router.navigate(['/datasets'], { state: { createdDataset: dataset.name } });
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.handleError(error);
      },
    });
  }

  private buildPayload(): DatasetCreatePayload {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      type: value.type as DatasetType,
      status: value.status,
      description: textOrNull(value.description),
      species: textOrNull(value.species),
      farm: textOrNull(value.farm),
      pool: textOrNull(value.pool),
      capture_date: value.capture_date || null,
      license: textOrNull(value.license),
      storage: {
        s3_uri: textOrNull(value.s3_uri),
        file_format: textOrNull(value.file_format),
        size_bytes: value.size_bytes,
        file_count: value.file_count,
      },
    };
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status !== 400 || typeof error.error !== 'object' || error.error === null) {
      this.submitError.set('No se pudo registrar el dataset. Inténtalo de nuevo más tarde.');
      return;
    }

    const body = error.error as Record<string, unknown>;
    const fieldErrors: Partial<Record<FieldName, string>> = {};
    const generalErrors: string[] = [];

    const collect = (source: Record<string, unknown>, nested: boolean) => {
      for (const [key, messages] of Object.entries(source)) {
        const message = Array.isArray(messages) ? `${messages[0]}` : `${messages}`;
        const isStorageField = STORAGE_FIELDS.includes(key as FieldName);

        if (key === 'storage' && typeof messages === 'object' && !Array.isArray(messages)) {
          collect(messages as Record<string, unknown>, true);
        } else if (key in this.form.controls && nested === isStorageField) {
          fieldErrors[key as FieldName] = message;
        } else {
          generalErrors.push(message);
        }
      }
    };

    collect(body, false);
    this.serverErrors.set(fieldErrors);
    this.submitError.set(
      generalErrors.length > 0 ? generalErrors.join(' ') : 'Revisa los campos marcados.',
    );
  }
}
