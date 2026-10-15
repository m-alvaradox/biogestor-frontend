import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Integration } from './integration';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('Integration', () => {
  let component: Integration;
  let fixture: ComponentFixture<Integration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Integration],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Integration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('shows the record returned by the API', () => {
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('/api/v1/integration/');

    expect(request.request.method).toBe('GET');
    expect(component.loading()).toBe(true);

    request.flush({
      id: 'sprint-0',
      message: 'Mensaje de prueba desde la API',
    });

    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('sprint-0');
    expect(fixture.nativeElement.textContent).toContain('Mensaje de prueba desde la API');
  });

  it('shows an error when the record is missing', () => {
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('/api/v1/integration/');

    request.flush(
      { detail: 'Registro de prueba no encontrado.' },
      { status: 404, statusText: 'Not Found' },
    );

    fixture.detectChanges();

    expect(component.loading()).toBe(false);
    expect(component.record()).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'No se pudo consultar el registro de integración.',
    );
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false);
  });
});
