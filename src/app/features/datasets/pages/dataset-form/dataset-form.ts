import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DATASET_STATUS_LABELS, DATASET_TYPE_LABELS } from '../../models/dataset-labels';
import {
  DatasetCreatePayload,
  DatasetDetail,
  DatasetOwner,
  DatasetStatus,
  DatasetType,
  DatasetUpdatePayload,
} from '../../models/dataset';
import { TYPE_METADATA_FIELDS, TypeMetadataField } from '../../models/dataset-type-metadata';
import { DatasetService } from '../../services/dataset';
import { UserService } from '../../../users/services/user';

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
  | 'owner'
  | 's3_uri'
  | 'file_format'
  | 'size_bytes'
  | 'file_count';

type TypeFieldValue = string | number | null;

type CustomFieldGroup = FormGroup<{
  key: FormControl<string>;
  value: FormControl<string>;
}>;

type LoadState = 'idle' | 'loading' | 'ready' | 'not-found' | 'error';

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

function positiveNumber(control: AbstractControl<TypeFieldValue>): ValidationErrors | null {
  const value = control.value;
  return value === null || value === '' || (typeof value === 'number' && value > 0)
    ? null
    : { positiveNumber: true };
}

function textOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function typeFieldValue(field: TypeMetadataField, raw: TypeFieldValue): unknown {
  if (raw === null || raw === '') {
    return null;
  }
  if (field.kind === 'number') {
    return Number(raw);
  }
  if (field.kind === 'list') {
    const items = `${raw}`
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
    return items.length > 0 ? items : null;
  }
  return textOrNull(`${raw}`);
}

function typeFieldInput(field: TypeMetadataField, value: unknown): TypeFieldValue {
  if (value === null || value === undefined) {
    return field.kind === 'number' ? null : '';
  }
  if (field.kind === 'number') {
    return typeof value === 'number' ? value : Number(value);
  }
  if (field.kind === 'list' && Array.isArray(value)) {
    return value.join(', ');
  }
  return metadataText(value);
}

function metadataText(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-dataset-form',
  styleUrl: './dataset-form.scss',
  templateUrl: './dataset-form.html',
})
export class DatasetForm implements OnInit {
  private readonly datasetService = inject(DatasetService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly id = input<string>();

  readonly typeOptions = Object.entries(DATASET_TYPE_LABELS) as [DatasetType, string][];
  readonly statusOptions = Object.entries(DATASET_STATUS_LABELS) as [DatasetStatus, string][];
  readonly maxDate = todayIso();

  readonly saving = signal(false);
  readonly submitError = signal('');
  readonly serverErrors = signal<Partial<Record<FieldName, string>>>({});
  readonly typeFields = signal<TypeMetadataField[]>([]);
  readonly owners = signal<DatasetOwner[]>([]);
  readonly ownersState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly loadState = signal<LoadState>('idle');
  readonly datasetId = signal<number | null>(null);
  readonly datasetName = signal('');
  readonly isEdit = computed(() => this.id() !== undefined);
  readonly cancelLink = computed(() =>
    this.datasetId() === null ? ['/datasets'] : ['/datasets', this.datasetId()],
  );

  private readonly omitWhenPristine = new Set<FieldName>();

  private readonly typeFieldControls = this.fb.record<FormControl<TypeFieldValue>>({});

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    type: ['' as DatasetType | '', Validators.required],
    status: ['active' as DatasetStatus | ''],
    description: [''],
    species: ['', Validators.maxLength(100)],
    farm: ['', Validators.maxLength(100)],
    pool: ['', Validators.maxLength(50)],
    capture_date: ['', notFutureDate],
    license: ['', Validators.maxLength(100)],
    owner: [{ value: null as number | null, disabled: true }],
    s3_uri: ['', Validators.maxLength(1024)],
    file_format: ['', Validators.maxLength(30)],
    size_bytes: [null as number | null, nonNegativeInteger],
    file_count: [null as number | null, nonNegativeInteger],
    type_fields: this.typeFieldControls,
    custom_fields: this.fb.array<CustomFieldGroup>([]),
  });

  constructor() {
    this.form.controls.custom_fields.addValidators(() =>
      this.form.controls.custom_fields.controls.some((_, index) => this.customFieldIssue(index))
        ? { customFields: true }
        : null,
    );

    this.form.controls.type.valueChanges.subscribe((type) => this.applyType(type));

    this.loadOwners();

    this.form.valueChanges.subscribe(() => {
      if (Object.keys(this.serverErrors()).length > 0) {
        this.serverErrors.set({});
      }
    });
  }

  ngOnInit(): void {
    if (this.isEdit()) {
      this.loadDataset();
    }
  }

  loadDataset(): void {
    const id = Number(this.id());

    if (!Number.isInteger(id) || id <= 0) {
      this.loadState.set('not-found');
      return;
    }

    this.loadState.set('loading');

    this.datasetService.get(id).subscribe({
      next: (dataset) => {
        this.fillForm(dataset);
        this.datasetId.set(id);
        this.datasetName.set(dataset.name);
        this.loadState.set('ready');
      },
      error: (response: HttpErrorResponse) => {
        this.loadState.set(response.status === 404 ? 'not-found' : 'error');
      },
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

  typeLabel(): string {
    const type = this.form.controls.type.value;
    return type ? DATASET_TYPE_LABELS[type] : '';
  }

  typeFieldError(key: string): string {
    const control = this.typeFieldControls.controls[key];

    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return '';
    }
    return 'Debe ser un número mayor que 0.';
  }

  addCustomField(): void {
    this.form.controls.custom_fields.push(this.fb.group({ key: [''], value: [''] }));
  }

  removeCustomField(index: number): void {
    this.form.controls.custom_fields.removeAt(index);
  }

  customFieldError(index: number): string {
    const row = this.form.controls.custom_fields.at(index);
    return row.touched || row.dirty ? this.customFieldIssue(index) : '';
  }

  save(): void {
    this.submitError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.submitError.set('Revisa los campos marcados antes de guardar.');
      return;
    }

    this.saving.set(true);

    const id = this.datasetId();
    const onError = (error: HttpErrorResponse) => {
      this.saving.set(false);
      this.handleError(error);
    };

    if (id === null) {
      this.datasetService.create(this.buildPayload()).subscribe({
        next: (dataset) => {
          this.saving.set(false);
          void this.router.navigate(['/datasets'], { state: { createdDataset: dataset.name } });
        },
        error: onError,
      });
      return;
    }

    this.datasetService.update(id, this.buildUpdatePayload()).subscribe({
      next: (dataset) => {
        this.saving.set(false);
        void this.router.navigate(['/datasets', id], {
          state: { updatedDataset: dataset.name },
        });
      },
      error: onError,
    });
  }

  private buildUpdatePayload(): DatasetUpdatePayload {
    const payload: DatasetUpdatePayload = this.buildPayload();

    for (const field of this.omitWhenPristine) {
      if (this.form.controls[field].pristine) {
        delete payload[field as keyof DatasetUpdatePayload];
      }
    }

    return payload;
  }

  private fillForm(dataset: DatasetDetail): void {
    const controls = this.form.controls;
    const metadata = dataset.type_metadata ?? {};
    const typeKeys = new Set(TYPE_METADATA_FIELDS[dataset.type].map((field) => field.key));

    controls.type.setValue(dataset.type);

    for (const field of this.typeFields()) {
      this.typeFieldControls.controls[field.key]?.setValue(
        typeFieldInput(field, metadata[field.key]),
      );
    }

    controls.custom_fields.clear();
    for (const [key, value] of Object.entries(metadata)) {
      if (!typeKeys.has(key)) {
        controls.custom_fields.push(this.fb.group({ key: [key], value: [metadataText(value)] }));
      }
    }

    this.form.patchValue({
      name: dataset.name,
      status: dataset.status || '',
      description: dataset.description ?? '',
      species: dataset.species ?? '',
      farm: dataset.farm ?? '',
      pool: dataset.pool ?? '',
      capture_date: dataset.capture_date ?? '',
      license: dataset.license ?? '',
      s3_uri: dataset.storage.s3_uri ?? '',
      file_format: dataset.storage.file_format ?? '',
      size_bytes: dataset.storage.size_bytes,
      file_count: dataset.storage.file_count,
    });
    controls.owner.setValue(dataset.owner?.id ?? null);

    this.omitWhenPristine.clear();
    if (!('description' in dataset)) {
      this.omitWhenPristine.add('description');
    }
    if (!('license' in dataset)) {
      this.omitWhenPristine.add('license');
    }
    if (!dataset.status) {
      this.omitWhenPristine.add('status');
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private buildPayload(): DatasetCreatePayload {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      type: value.type as DatasetType,
      status: value.status as DatasetStatus,
      description: textOrNull(value.description),
      species: textOrNull(value.species),
      farm: textOrNull(value.farm),
      pool: textOrNull(value.pool),
      capture_date: value.capture_date || null,
      license: textOrNull(value.license),
      owner: value.owner,
      type_metadata: this.buildTypeMetadata(),
      storage: {
        s3_uri: textOrNull(value.s3_uri),
        file_format: textOrNull(value.file_format),
        size_bytes: value.size_bytes,
        file_count: value.file_count,
      },
    };
  }

  private loadOwners(): void {
    this.userService.list().subscribe({
      next: (owners) => {
        this.owners.set(owners);
        this.ownersState.set('ready');
        this.form.controls.owner.enable();
      },
      error: () => this.ownersState.set('error'),
    });
  }

  private applyType(type: DatasetType | ''): void {
    const fields = type ? TYPE_METADATA_FIELDS[type] : [];
    const group = this.typeFieldControls;

    for (const key of Object.keys(group.controls)) {
      group.removeControl(key);
    }
    for (const field of fields) {
      group.addControl(
        field.key,
        this.fb.control<TypeFieldValue>(
          field.kind === 'number' ? null : '',
          field.kind === 'number' ? positiveNumber : null,
        ),
      );
    }

    this.typeFields.set(fields);
    this.form.controls.custom_fields.updateValueAndValidity();
  }

  private customFieldIssue(index: number): string {
    const rows = this.form.controls.custom_fields.getRawValue();
    const key = rows[index]?.key.trim() ?? '';
    const value = rows[index]?.value.trim() ?? '';

    if (key === '') {
      return value === '' ? '' : 'Indica el nombre del campo.';
    }
    if (this.typeFields().some((field) => field.key === key)) {
      return 'Este campo ya tiene su propia casilla arriba.';
    }
    if (rows.findIndex((row) => row.key.trim() === key) !== index) {
      return 'Este campo ya está en la lista.';
    }
    return '';
  }

  private buildTypeMetadata(): Record<string, unknown> | null {
    const metadata: Record<string, unknown> = {};
    const values = this.typeFieldControls.getRawValue();

    for (const field of this.typeFields()) {
      const value = typeFieldValue(field, values[field.key] ?? null);
      if (value !== null) {
        metadata[field.key] = value;
      }
    }
    for (const row of this.form.controls.custom_fields.getRawValue()) {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key !== '' && value !== '') {
        metadata[key] = value;
      }
    }

    return Object.keys(metadata).length > 0 ? metadata : null;
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 404 && this.isEdit()) {
      this.submitError.set('El dataset ya no existe. Pudo haber sido eliminado.');
      return;
    }
    if (error.status !== 400 || typeof error.error !== 'object' || error.error === null) {
      this.submitError.set(
        this.isEdit()
          ? 'No se pudieron guardar los cambios. Inténtalo de nuevo más tarde.'
          : 'No se pudo registrar el dataset. Inténtalo de nuevo más tarde.',
      );
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
