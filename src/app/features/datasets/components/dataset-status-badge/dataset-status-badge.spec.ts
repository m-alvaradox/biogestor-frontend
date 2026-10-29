import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatasetStatusBadge } from './dataset-status-badge';

describe('DatasetStatusBadge', () => {
  let fixture: ComponentFixture<DatasetStatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetStatusBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetStatusBadge);
  });

  function render(status: string | null): HTMLElement {
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('app-badge');
  }

  it('should translate each status and pick its tone', () => {
    const cases = [
      ['active', 'Activo', 'badge-success'],
      ['processing', 'Procesando', 'badge-warning'],
      ['archived', 'Archivado', 'badge-muted'],
      ['error', 'Error', 'badge-danger'],
    ];

    for (const [status, label, tone] of cases) {
      const badge = render(status);

      expect(badge.textContent?.trim()).toBe(label);
      expect(badge.classList).toContain(tone);
    }
  });

  it('should show "Sin estado" when the status is null or empty', () => {
    for (const status of [null, '']) {
      const badge = render(status);

      expect(badge.textContent?.trim()).toBe('Sin estado');
      expect(badge.classList).toContain('badge-neutral');
    }
  });
});
