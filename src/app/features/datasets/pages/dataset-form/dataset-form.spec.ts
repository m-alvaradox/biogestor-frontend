import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { DatasetForm } from './dataset-form';

describe('DatasetForm', () => {
  let fixture: ComponentFixture<DatasetForm>;
  let component: DatasetForm;
  let http: HttpTestingController;
  let router: Router;

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
      storage: {
        s3_uri: 's3://biogestor-data/audio/002/',
        file_format: null,
        size_bytes: null,
        file_count: null,
      },
    });
    expect(element<HTMLButtonElement>('button[type="submit"]').disabled).toBe(true);

    request.flush({ id: 9, name: 'Lote de audio de tilapia 002' });

    expect(router.navigate).toHaveBeenCalledWith(['/datasets'], {
      state: { createdDataset: 'Lote de audio de tilapia 002' },
    });
  });

  it('should show field and general errors returned by the API', () => {
    fillRequired();
    submit();

    http.expectOne('/api/v1/datasets/').flush(
      {
        name: ['Asegúrese de que este campo no tenga más de 150 caracteres.'],
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
