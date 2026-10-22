import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([
          {
            path: 'dashboard',
            component: Sidebar,
          },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the nine main navigation options', () => {
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('nav[aria-label="Navegación principal"] a'),
    );

    expect(links.length).toBe(9);

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Panel Principal',
      'Datasets',
      'Modelos',
      'Versiones',
      'Experimentos',
      'Observaciones',
      'Usuarios',
      'Integraciones',
      'Configuración',
    ]);
  });

  it('should link Dashboard and Datasets to their routes', () => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('nav a'));

    expect(links[0].getAttribute('href')).toBe('/dashboard');
    expect(links[1].getAttribute('href')).toBe('/datasets');
  });

  it('should use the official integrations route', () => {
    const integrationLink: HTMLAnchorElement | undefined = Array.from(
      fixture.nativeElement.querySelectorAll('nav a') as HTMLAnchorElement[],
    ).find((link) => link.textContent?.trim() === 'Integraciones');

    expect(integrationLink).toBeDefined();
    expect(integrationLink?.getAttribute('href')).toBe('/integrations');
  });

  it('should highlight the active Dashboard route', async () => {
    await router.navigateByUrl('/dashboard');
    fixture.detectChanges();
    await fixture.whenStable();

    const dashboardLink: HTMLAnchorElement = fixture.nativeElement.querySelector('nav a');

    expect(dashboardLink.classList.contains('active')).toBe(true);
  });
});
