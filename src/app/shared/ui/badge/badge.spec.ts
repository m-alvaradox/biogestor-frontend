import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

describe('Badge', () => {
  let fixture: ComponentFixture<Badge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge],
    }).compileComponents();

    fixture = TestBed.createComponent(Badge);
    fixture.componentRef.setInput('label', 'Activo');
  });

  it('should display the label with the neutral tone by default', () => {
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    expect(host.textContent?.trim()).toBe('Activo');
    expect(host.classList).toContain('badge-neutral');
  });

  it('should apply the requested tone', () => {
    fixture.componentRef.setInput('tone', 'danger');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('badge-danger');
  });
});
