import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ModulePlaceholder } from './module-placeholder';

describe('ModulePlaceholder', () => {
  let component: ModulePlaceholder;
  let fixture: ComponentFixture<ModulePlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulePlaceholder],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: { title: 'Modelos' },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulePlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title provided by the route', () => {
    const heading = fixture.nativeElement.querySelector('h1');

    expect(heading.textContent.trim()).toBe('Modelos');
  });

  it('should indicate that the module is pending implementation', () => {
    const content = fixture.nativeElement.textContent;

    expect(content).toContain('Módulo pendiente de implementación');
  });
});
