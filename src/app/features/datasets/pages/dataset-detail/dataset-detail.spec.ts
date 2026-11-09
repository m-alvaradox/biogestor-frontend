import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Navigation, Router, provideRouter } from '@angular/router';

import { DatasetDetail } from '../../models/dataset';
import { DatasetDetailPage } from './dataset-detail';

describe('DatasetDetailPage', () => {
  let fixture: ComponentFixture<DatasetDetailPage>;
  let http: HttpTestingController;

  const audioDataset: DatasetDetail = {
    id: 5,
    name: 'Cantos de tilapia',
    type: 'audio',
    status: 'active',
    owner: { id: 3, name: 'Dra. Ana Lima' },
    created_at: '2026-10-20T15:30:00Z',
    species: 'Tilapia',
    farm: 'Granja Norte',
    pool: 'P-01',
    capture_date: '2026-10-01',
    type_metadata: { sample_rate: 44100, channels: 2 },
    storage: {
      s3_uri: 's3://biogestor/datasets/5/',
      file_format: '.WAV',
      size_bytes: 2.4 * 1024 ** 3,
      file_count: 12,
    },
  };

  const imageDataset: DatasetDetail = {
    id: 6,
    name: 'Fotos de camarón',
    type: 'image',
    status: 'archived',
    owner: null,
    created_at: '2026-10-18T10:00:00Z',
    species: null,
    farm: null,
    pool: null,
    capture_date: null,
    type_metadata: null,
    storage: { s3_uri: null, file_format: null, size_bytes: null, file_count: null },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetDetailPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetDetailPage);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  function open(id: string): void {
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function fields(section: number): string[][] {
    const card = fixture.nativeElement.querySelectorAll('.detail-card')[section];
    const terms = Array.from(card.querySelectorAll('dt')) as HTMLElement[];
    return terms.map((term) => [
      term.textContent?.trim() ?? '',
      (term.nextElementSibling as HTMLElement).textContent?.trim() ?? '',
    ]);
  }

  it('should show a loading message while the request is pending', () => {
    open('5');

    expect(text()).toContain('Cargando dataset...');

    http.expectOne('/api/v1/datasets/5/').flush(audioDataset);
  });

  it('should display the metadata of the requested dataset', () => {
    open('5');
    http.expectOne('/api/v1/datasets/5/').flush(audioDataset);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Cantos de tilapia');
    expect(text()).toContain('Audio');
    expect(text()).toContain('Activo');
    expect(text()).toContain('Investigador: Dra. Ana Lima');
    expect(text()).toContain('Registrado el 20/10/2026');
    expect(fields(0)).toEqual([
      ['Especie', 'Tilapia'],
      ['Granja', 'Granja Norte'],
      ['Piscina', 'P-01'],
      ['Fecha de captura', '01/10/2026'],
      ['sample_rate', '44100'],
      ['channels', '2'],
    ]);
    expect(fields(1)).toEqual([
      ['Ubicación', 's3://biogestor/datasets/5/'],
      ['Formato', '.WAV'],
      ['Tamaño', '2.4 GB'],
      ['Archivos', '12'],
    ]);
  });

  it('should display a different dataset with empty values', () => {
    open('6');
    http.expectOne('/api/v1/datasets/6/').flush(imageDataset);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Fotos de camarón');
    expect(text()).toContain('Imagen');
    expect(text()).toContain('Archivado');
    expect(text()).toContain('Investigador: —');
    expect(fields(0).map(([, value]) => value)).toEqual(['—', '—', '—', '—']);
    expect(fields(1).map(([, value]) => value)).toEqual(['—', '—', '—', '—']);
  });

  it('should show a dash for empty text values', () => {
    open('6');
    http.expectOne('/api/v1/datasets/6/').flush({
      ...imageDataset,
      species: '',
      farm: '',
      pool: '',
      type_metadata: {},
      storage: { s3_uri: '', file_format: '', size_bytes: null, file_count: 0 },
    });
    fixture.detectChanges();

    expect(fields(0).map(([, value]) => value)).toEqual(['—', '—', '—', '—']);
    expect(fields(1).map(([, value]) => value)).toEqual(['—', '—', '—', '0']);
  });

  it('should show "Sin estado" when the dataset has no status', () => {
    open('6');
    http.expectOne('/api/v1/datasets/6/').flush({ ...imageDataset, status: null });
    fixture.detectChanges();

    expect(text()).toContain('Sin estado');
  });

  it('should link the edit button to the edit form', () => {
    open('5');
    http.expectOne('/api/v1/datasets/5/').flush(audioDataset);
    fixture.detectChanges();

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.header-actions a');

    expect(link.textContent?.trim()).toBe('Editar');
    expect(link.getAttribute('href')).toBe('/datasets/5/edit');
    expect(fixture.nativeElement.querySelector('.success-message')).toBeNull();
  });

  it('should confirm the update when coming back from the edit form', () => {
    vi.spyOn(TestBed.inject(Router), 'currentNavigation').mockReturnValue({
      extras: { state: { updatedDataset: 'Cantos de tilapia v2' } },
    } as unknown as Navigation);
    fixture.destroy();
    fixture = TestBed.createComponent(DatasetDetailPage);
    open('5');
    http.expectOne('/api/v1/datasets/5/').flush(audioDataset);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.success-message').textContent).toContain(
      'Dataset "Cantos de tilapia v2" actualizado correctamente.',
    );
  });

  it('should confirm the registration when coming from the create form', () => {
    vi.spyOn(TestBed.inject(Router), 'currentNavigation').mockReturnValue({
      extras: { state: { createdDataset: 'Cantos de tilapia' } },
    } as unknown as Navigation);
    fixture.destroy();
    fixture = TestBed.createComponent(DatasetDetailPage);
    open('5');
    http.expectOne('/api/v1/datasets/5/').flush(audioDataset);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.success-message').textContent).toContain(
      'Dataset "Cantos de tilapia" registrado correctamente.',
    );
  });

  it('should show "No encontrado" when the API returns 404', () => {
    open('999999');
    http
      .expectOne('/api/v1/datasets/999999/')
      .flush({ detail: 'No encontrado.' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(text()).toContain('No encontrado');
    expect(text()).toContain('999999');
  });

  it('should show "No encontrado" without calling the API for an invalid id', () => {
    open('abc');

    http.expectNone(() => true);
    expect(text()).toContain('No encontrado');
  });

  it('should show an error and retry the request', () => {
    open('5');
    http
      .expectOne('/api/v1/datasets/5/')
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(text()).toContain('No se pudo cargar el dataset.');

    fixture.nativeElement.querySelector('.state-card button').click();
    http.expectOne('/api/v1/datasets/5/').flush(audioDataset);
    fixture.detectChanges();

    expect(text()).not.toContain('No se pudo cargar el dataset.');
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Cantos de tilapia');
  });

  it('should link back to the catalog', () => {
    open('abc');

    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.back-link');

    expect(link.getAttribute('href')).toBe('/datasets');
  });

  describe('delete', () => {
    let router: Router;

    beforeEach(() => {
      router = TestBed.inject(Router);
      vi.spyOn(router, 'navigate').mockResolvedValue(true);
      open('5');
      http.expectOne('/api/v1/datasets/5/').flush(audioDataset);
      fixture.detectChanges();
      fixture.nativeElement.querySelector('.header-actions .btn-danger').click();
      fixture.detectChanges();
    });

    function dialog(): HTMLElement | null {
      return fixture.nativeElement.querySelector('[role="alertdialog"]');
    }

    function dialogButton(label: string): HTMLButtonElement {
      const buttons = Array.from(
        fixture.nativeElement.querySelectorAll('.dialog-actions button'),
      ) as HTMLButtonElement[];
      return buttons.find((button) => button.textContent?.trim() === label)!;
    }

    it('should ask for confirmation before deleting', () => {
      expect(dialog()?.textContent).toContain(
        '¿Eliminar «Cantos de tilapia»? Esta acción no se puede deshacer.',
      );
      http.expectNone('/api/v1/datasets/5/');
    });

    it('should close the dialog without deleting when cancelled', () => {
      dialogButton('Cancelar').click();
      fixture.detectChanges();

      expect(dialog()).toBeNull();
      http.expectNone('/api/v1/datasets/5/');
    });

    it('should delete the dataset and return to the catalog', () => {
      dialogButton('Eliminar').click();
      fixture.detectChanges();

      const request = http.expectOne('/api/v1/datasets/5/');
      expect(request.request.method).toBe('DELETE');
      expect(dialogButton('Eliminando...').disabled).toBe(true);

      request.flush(null, { status: 204, statusText: 'No Content' });

      expect(router.navigate).toHaveBeenCalledWith(['/datasets'], {
        state: { deletedDataset: 'Cantos de tilapia' },
      });
    });

    it('should stay on the detail and explain a 404 instead of assuming the deletion', () => {
      dialogButton('Eliminar').click();
      http
        .expectOne('/api/v1/datasets/5/')
        .flush({ detail: 'No encontrado.' }, { status: 404, statusText: 'Not Found' });
      fixture.detectChanges();

      expect(dialog()?.textContent).toContain(
        'El dataset no existe o la eliminación no está disponible.',
      );
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should keep the dialog open and show the reason when the API refuses', () => {
      dialogButton('Eliminar').click();
      http
        .expectOne('/api/v1/datasets/5/')
        .flush(
          { detail: 'El dataset tiene experimentos asociados.' },
          { status: 409, statusText: 'Conflict' },
        );
      fixture.detectChanges();

      expect(dialog()?.textContent).toContain('El dataset tiene experimentos asociados.');
      expect(dialogButton('Eliminar').disabled).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should show a generic message when the server fails', () => {
      dialogButton('Eliminar').click();
      http
        .expectOne('/api/v1/datasets/5/')
        .flush(null, { status: 500, statusText: 'Internal Server Error' });
      fixture.detectChanges();

      expect(dialog()?.textContent).toContain('No se pudo eliminar el dataset.');
    });
  });
});
