import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  TestRequest,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

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
