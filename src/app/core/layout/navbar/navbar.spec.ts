import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // Prueba para no tener seccion usuario en la barra superior.
  it('should not render a user section', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.user-info')).toBeNull();
    expect(el.querySelector('.user-avatar')).toBeNull();
  });
});
