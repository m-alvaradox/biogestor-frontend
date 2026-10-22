import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetList } from './dataset-list';

describe('DatasetList', () => {
  let component: DatasetList;
  let fixture: ComponentFixture<DatasetList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetList],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the Datasets page title', () => {
    const heading = fixture.nativeElement.querySelector('h1');

    expect(heading.textContent.trim()).toBe('Datasets');
  });

  it('should display the catalog table headers', () => {
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

  it('should indicate that API integration is pending', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Catálogo pendiente de integración');
  });

  it('should keep unavailable controls disabled', () => {
    const createButton = fixture.nativeElement.querySelector('.btn-primary');

    const searchInput = fixture.nativeElement.querySelector('.search-input');

    const typeFilter = fixture.nativeElement.querySelector('.type-filter');

    expect(createButton.disabled).toBe(true);
    expect(searchInput.disabled).toBe(true);
    expect(typeFilter.disabled).toBe(true);
  });
});
