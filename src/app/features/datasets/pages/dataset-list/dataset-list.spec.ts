import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { DatasetPage } from '../../models/dataset';
import { DatasetList } from './dataset-list';

describe('DatasetList', () => {
  let component: DatasetList;
  let fixture: ComponentFixture<DatasetList>;
  let http: HttpTestingController;

  const emptyPage: DatasetPage = { count: 0, next: null, previous: null, results: [] };

  const filledPage: DatasetPage = {
    count: 3,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        name: 'Cantos de aves',
        type: 'audio',
        status: 'active',
        owner: { id: 3, name: 'Dra. Ana Lima' },
        created_at: '2026-10-20T15:30:00Z',
      },
      {
        id: 2,
        name: 'Fotos de estanques',
        type: 'image',
        status: null,
        owner: null,
        created_at: '2026-10-18T10:00:00Z',
      },
      {
        id: 3,
        name: 'Mediciones de oxígeno',
        type: 'csv',
        status: 'error',
        owner: { id: 5, name: 'Ing. Carlos Vera' },
        created_at: '2026-10-15T08:45:00Z',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetList);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  function respond(page: DatasetPage): void {
    http.expectOne('/api/v1/datasets/').flush(page);
    fixture.detectChanges();
  }

  function rows(): HTMLTableRowElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  it('should display the Datasets page title', () => {
    respond(emptyPage);

    const heading = fixture.nativeElement.querySelector('h1');

    expect(heading.textContent.trim()).toBe('Datasets');
  });

  it('should display the catalog table headers', () => {
    respond(emptyPage);

    const headers = Array.from(fixture.nativeElement.querySelectorAll('th')).map((element) =>
      (element as HTMLElement).textContent?.trim(),
    );

    expect(headers).toEqual([
      'Nombre',
      'Tipo',
      'Investigador',
      'Fecha de registro',
      'Estado',
      'Acciones',
    ]);
  });

  it('should show a loading message while the request is pending', () => {
    expect(component.loading()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Cargando datasets...');

    respond(emptyPage);

    expect(component.loading()).toBe(false);
  });

  it('should show the empty state when there are no datasets', () => {
    respond(emptyPage);

    expect(rows().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('No hay datasets registrados');
  });

  it('should list the datasets returned by the API', () => {
    respond(filledPage);

    const cells = rows().map((row) =>
      Array.from(row.querySelectorAll('td'))
        .slice(0, 5)
        .map((cell) => cell.textContent?.trim()),
    );

    expect(cells).toEqual([
      ['Cantos de aves', 'Audio', 'Dra. Ana Lima', '20/10/2026', 'Activo'],
      ['Fotos de estanques', 'Imagen', '—', '18/10/2026', 'Sin estado'],
      ['Mediciones de oxígeno', 'CSV', 'Ing. Carlos Vera', '15/10/2026', 'Error'],
    ]);
  });

  it('should apply a badge tone for each status', () => {
    respond(filledPage);

    const badges = rows().map((row) => row.querySelector('td:nth-child(5) app-badge'));

    expect(badges[0]?.classList).toContain('badge-success');
    expect(badges[1]?.classList).toContain('badge-neutral');
    expect(badges[2]?.classList).toContain('badge-danger');
  });

  it('should show view, edit and delete actions for each dataset', () => {
    respond(filledPage);

    const actions = rows().map((row) =>
      Array.from(row.querySelectorAll('.row-actions .action')).map((action) =>
        action.textContent?.trim(),
      ),
    );

    expect(actions).toEqual([
      ['Ver', 'Editar', 'Eliminar'],
      ['Ver', 'Editar', 'Eliminar'],
      ['Ver', 'Editar', 'Eliminar'],
    ]);
  });

  it('should link each dataset to its detail page', () => {
    respond(filledPage);

    const links = rows().map((row) => row.querySelector('.action-view')?.getAttribute('href'));

    expect(links).toEqual(['/datasets/1', '/datasets/2', '/datasets/3']);
  });

  it('should keep edit and delete actions disabled', () => {
    respond(filledPage);

    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('.action-edit, .action-delete'),
    ) as HTMLButtonElement[];

    expect(buttons.length).toBe(6);
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('should show an error and retry the request', () => {
    http
      .expectOne('/api/v1/datasets/')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'No se pudo cargar el catálogo de datasets.',
    );

    const retry: HTMLButtonElement = fixture.nativeElement.querySelector('tbody button');
    retry.click();
    fixture.detectChanges();

    respond(filledPage);

    expect(component.error()).toBe('');
    expect(rows().length).toBe(3);
  });

  it('should keep unavailable controls disabled', () => {
    respond(emptyPage);

    const createButton = fixture.nativeElement.querySelector('.btn-primary');
    const searchInput = fixture.nativeElement.querySelector('.search-input');
    const typeFilter = fixture.nativeElement.querySelector('.type-filter');

    expect(createButton.disabled).toBe(true);
    expect(searchInput.disabled).toBe(true);
    expect(typeFilter.disabled).toBe(true);
  });
});
