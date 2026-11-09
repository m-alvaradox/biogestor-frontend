import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { DatasetDetail } from '../../models/dataset';
import { DatasetForm } from './dataset-form';

describe('DatasetForm', () => {
  let fixture: ComponentFixture<DatasetForm>;
  let component: DatasetForm;
  let http: HttpTestingController;
  let router: Router;
  let ownersRequest: TestRequest;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetForm);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    ownersRequest = http.expectOne('/api/v1/users/');
  });

  afterEach(() => {
    http.verify();
  });

  function element<T extends HTMLElement>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  function submit(): void {
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function loadOwners(): void {
    ownersRequest.flush([
      { id: 2, name: 'Dra. Ana Lima' },
      { id: 3, name: 'Ing. Carlos Mora' },
    ]);
    fixture.detectChanges();
  }

  function fillRequired(): void {
    component.form.patchValue({ name: '  Lote de audio de tilapia 002  ', type: 'audio' });
  }

  it('should display the registration title and breadcrumb', () => {
    expect(element('h1').textContent?.trim()).toBe('Registrar nuevo conjunto');
    expect(element('.breadcrumb a').getAttribute('href')).toBe('/datasets');
  });

  it('should offer every dataset type and default the status to active', () => {
    const types = Array.from(element<HTMLSelectElement>('#type').options).map((option) =>
      option.textContent?.trim(),
    );

    expect(types).toEqual([
      'Selecciona un tipo...',
      'Audio',
      'Imagen',
      'Video',
      'CSV',
      'Texto',
      'Otro',
    ]);
    expect(component.form.controls.status.value).toBe('active');
  });

  it('should keep the researcher select disabled while the users load', () => {
    const owner = element<HTMLSelectElement>('#owner');

    expect(ownersRequest.request.method).toBe('GET');
    expect(owner.disabled).toBe(true);
    expect(owner.selectedOptions[0].textContent?.trim()).toBe('Cargando investigadores...');
  });

  it('should list the active users as researchers once they load', () => {
    loadOwners();

    const owner = element<HTMLSelectElement>('#owner');
    const options = Array.from(owner.options).map((option) => option.textContent?.trim());

    expect(owner.disabled).toBe(false);
    expect(options).toEqual(['Sin asignar', 'Dra. Ana Lima', 'Ing. Carlos Mora']);
    expect(component.form.controls.owner.value).toBeNull();
  });

  it('should tell the user when there are no active researchers', () => {
    ownersRequest.flush([]);
    fixture.detectChanges();

    expect(element('#owner-hint').textContent).toContain('No hay investigadores activos');
  });

  it('should disable the researcher select and still save when the users fail to load', () => {
    ownersRequest.flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(element<HTMLSelectElement>('#owner').disabled).toBe(true);
    expect(element('#owner-hint').textContent).toContain(
      'No se pudo cargar la lista de investigadores.',
    );

    fillRequired();
    submit();

    const request = http.expectOne('/api/v1/datasets/');
    expect(request.request.body.owner).toBeNull();
    request.flush({ id: 9, name: 'Lote de audio de tilapia 002' });
  });

  it('should send the selected researcher id as owner', () => {
    loadOwners();
    fillRequired();
    const owner = element<HTMLSelectElement>('#owner');
    owner.value = owner.options[2].value;
    owner.dispatchEvent(new Event('change'));
    submit();

    const request = http.expectOne('/api/v1/datasets/');
    expect(request.request.body.owner).toBe(3);
    request.flush({ id: 9, name: 'Lote de audio de tilapia 002' });
  });

  it('should not send the form and show errors when required fields are empty', () => {
    submit();

    expect(fixture.nativeElement.textContent).toContain('Este campo es obligatorio.');
    expect(element('.submit-error').textContent).toContain('Revisa los campos marcados');
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(2);
  });

  it('should validate length, future capture dates and non-negative integers', () => {
    component.form.patchValue({
      name: 'a'.repeat(151),
      capture_date: '2999-01-01',
      size_bytes: -1,
      file_count: 1.5,
    });
    component.form.markAllAsTouched();
    fixture.detectChanges();

    expect(component.errorFor('name')).toBe('Máximo 150 caracteres.');
    expect(component.errorFor('capture_date')).toBe('La fecha de captura no puede ser futura.');
    expect(component.errorFor('size_bytes')).toBe('Debe ser un número entero mayor o igual a 0.');
    expect(component.errorFor('file_count')).toBe('Debe ser un número entero mayor o igual a 0.');
  });

  it('should send a trimmed payload with nulls for empty fields and return to the catalog', () => {
    fillRequired();
    component.form.patchValue({ species: 'Tilapia', s3_uri: 's3://biogestor-data/audio/002/' });
    submit();

    const request = http.expectOne('/api/v1/datasets/');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      name: 'Lote de audio de tilapia 002',
      type: 'audio',
      status: 'active',
      description: null,
      species: 'Tilapia',
      farm: null,
      pool: null,
      capture_date: null,
      license: null,
      owner: null,
      type_metadata: null,
      storage: {
        s3_uri: 's3://biogestor-data/audio/002/',
        file_format: null,
        size_bytes: null,
        file_count: null,
      },
    });
    expect(element<HTMLButtonElement>('button[type="submit"]').disabled).toBe(true);

    request.flush({ id: 9, name: 'Lote de audio de tilapia 002' });

    expect(router.navigate).toHaveBeenCalledWith(['/datasets', 9], {
      state: { createdDataset: 'Lote de audio de tilapia 002' },
    });
  });

  it('should show field and general errors returned by the API', () => {
    fillRequired();
    submit();

    http.expectOne('/api/v1/datasets/').flush(
      {
        name: ['Asegúrese de que este campo no tenga más de 150 caracteres.'],
        owner: ['Clave primaria "99" inválida - objeto no existe.'],
        storage: { s3_uri: ['Referencia no válida.'] },
        __all__: ['Ya existe un dataset con esta referencia de S3.'],
      },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(component.errorFor('name')).toBe(
      'Asegúrese de que este campo no tenga más de 150 caracteres.',
    );
    expect(component.errorFor('s3_uri')).toBe('Referencia no válida.');
    expect(component.errorFor('owner')).toBe('Clave primaria "99" inválida - objeto no existe.');
    expect(element('.submit-error').textContent).toContain(
      'Ya existe un dataset con esta referencia de S3.',
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should clear API errors once the user edits the form', () => {
    fillRequired();
    submit();
    http
      .expectOne('/api/v1/datasets/')
      .flush({ name: ['Nombre no válido.'] }, { status: 400, statusText: 'Bad Request' });

    component.form.controls.name.setValue('Otro nombre');

    expect(component.errorFor('name')).toBe('');
  });

  it('should show a generic message when the server fails', () => {
    fillRequired();
    submit();

    http.expectOne('/api/v1/datasets/').flush(null, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(element('.submit-error').textContent).toContain('No se pudo registrar el dataset.');
    expect(element<HTMLButtonElement>('button[type="submit"]').disabled).toBe(false);
  });

  it('should link the cancel button back to the catalog', () => {
    const cancel = element('.actions-card .btn-secondary');

    expect(cancel.textContent?.trim()).toBe('Cancelar');
    expect(cancel.getAttribute('href')).toBe('/datasets');
  });
});

describe('DatasetForm in edit mode', () => {
  let fixture: ComponentFixture<DatasetForm>;
  let component: DatasetForm;
  let http: HttpTestingController;
  let router: Router;

  const detail: DatasetDetail = {
    id: 5,
    name: 'Cantos de tilapia',
    type: 'audio',
    status: 'processing',
    owner: { id: 3, name: 'Ing. Carlos Mora' },
    created_at: '2026-10-20T15:30:00Z',
    species: 'Tilapia',
    farm: 'Granja Norte',
    pool: null,
    capture_date: '2026-10-01',
    type_metadata: { sample_rate: 44100, hydrophone_depth: 2, tags: ['noche', 'lluvia'] },
    storage: {
      s3_uri: 's3://biogestor/datasets/5/',
      file_format: '.WAV',
      size_bytes: 1024,
      file_count: 12,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetForm);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.componentRef.setInput('id', '5');
    fixture.detectChanges();
    http.expectOne('/api/v1/users/').flush([
      { id: 2, name: 'Dra. Ana Lima' },
      { id: 3, name: 'Ing. Carlos Mora' },
    ]);
  });

  afterEach(() => {
    http.verify();
  });

  function element<T extends HTMLElement>(selector: string): T {
    return fixture.nativeElement.querySelector(selector);
  }

  function loadDataset(dataset: DatasetDetail = detail): void {
    http.expectOne('/api/v1/datasets/5/').flush(dataset);
    fixture.detectChanges();
  }

  function submit(): void {
    element<HTMLFormElement>('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('should show a loading message and hide the form until the dataset arrives', () => {
    expect(element('.state-card').textContent).toContain('Cargando dataset...');
    expect(element<HTMLFormElement>('form').hidden).toBe(true);

    loadDataset();

    expect(element('.state-card')).toBeNull();
    expect(element<HTMLFormElement>('form').hidden).toBe(false);
  });

  it('should display the edit title and a breadcrumb back to the dataset', () => {
    loadDataset();

    const links = fixture.nativeElement.querySelectorAll('.breadcrumb a');

    expect(element('h1').textContent?.trim()).toBe('Editar conjunto');
    expect(links[1].textContent.trim()).toBe('Cantos de tilapia');
    expect(links[1].getAttribute('href')).toBe('/datasets/5');
    expect(element('button[type="submit"]').textContent?.trim()).toBe('Guardar cambios');
  });

  it('should fill the form with the current values of the dataset', () => {
    loadDataset();

    const value = component.form.getRawValue();

    expect(value.name).toBe('Cantos de tilapia');
    expect(value.type).toBe('audio');
    expect(value.status).toBe('processing');
    expect(value.owner).toBe(3);
    expect(value.species).toBe('Tilapia');
    expect(value.pool).toBe('');
    expect(value.capture_date).toBe('2026-10-01');
    expect(value.s3_uri).toBe('s3://biogestor/datasets/5/');
    expect(value.size_bytes).toBe(1024);
    expect(value.type_fields).toEqual({ microphone: '', sample_rate: 44100 });
    expect(value.custom_fields).toEqual([
      { key: 'hydrophone_depth', value: '2' },
      { key: 'tags', value: '["noche","lluvia"]' },
    ]);
    expect(component.form.pristine).toBe(true);
  });

  it('should send a PATCH and return to the detail with the new name', () => {
    loadDataset();

    component.form.controls.name.setValue('Cantos de tilapia v2');
    submit();

    const request = http.expectOne('/api/v1/datasets/5/');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.name).toBe('Cantos de tilapia v2');
    expect(request.request.body.owner).toBe(3);
    expect(request.request.body.type_metadata).toEqual({
      sample_rate: 44100,
      hydrophone_depth: '2',
      tags: '["noche","lluvia"]',
    });

    request.flush({ ...detail, name: 'Cantos de tilapia v2', owner: 3 });

    expect(router.navigate).toHaveBeenCalledWith(['/datasets', 5], {
      state: { updatedDataset: 'Cantos de tilapia v2' },
    });
  });

  it('should not send description, license or status when the API did not provide them', () => {
    loadDataset({ ...detail, status: null });

    expect(element<HTMLSelectElement>('#status').selectedOptions[0].textContent?.trim()).toBe(
      'Sin estado',
    );

    submit();

    const body = http.expectOne('/api/v1/datasets/5/').request.body;
    expect('description' in body).toBe(false);
    expect('license' in body).toBe(false);
    expect('status' in body).toBe(false);
  });

  it('should send description when the user writes one', () => {
    loadDataset();

    component.form.controls.description.setValue('Grabaciones nocturnas');
    component.form.controls.description.markAsDirty();
    submit();

    const body = http.expectOne('/api/v1/datasets/5/').request.body;
    expect(body.description).toBe('Grabaciones nocturnas');
    expect(body.status).toBe('processing');
  });

  it('should link the cancel button back to the dataset detail', () => {
    loadDataset();

    expect(element('.actions-card a').getAttribute('href')).toBe('/datasets/5');
  });

  it('should show a not found message when the dataset does not exist', () => {
    http
      .expectOne('/api/v1/datasets/5/')
      .flush({ detail: 'No encontrado.' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(element('.state-card').textContent).toContain('No se encontró el dataset solicitado.');
    expect(element<HTMLFormElement>('form').hidden).toBe(true);
  });

  it('should tell the user when the dataset was deleted before saving', () => {
    loadDataset();

    submit();
    http
      .expectOne('/api/v1/datasets/5/')
      .flush({ detail: 'No encontrado.' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(element('.submit-error').textContent).toContain('El dataset ya no existe.');
  });
});
