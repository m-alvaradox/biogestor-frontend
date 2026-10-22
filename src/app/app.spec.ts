import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should redirect the root route to the dashboard', async () => {
    const harness = await RouterTestingHarness.create('/');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Panel principal',
    );

    expect(harness.routeNativeElement?.querySelectorAll('app-stat-card').length).toBe(4);
  });

  it('should navigate to the Datasets catalog', async () => {
    const harness = await RouterTestingHarness.create('/datasets');

    expect(harness.routeNativeElement?.querySelector('app-dataset-list')).not.toBeNull();

    expect(harness.routeNativeElement?.textContent).toContain('Catálogo pendiente de integración');
  });

  it('should navigate to the Models and Experiments placeholders', async () => {
    const harness = await RouterTestingHarness.create('/models');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Modelos');

    await harness.navigateByUrl('/experiments');

    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Experimentos');
  });

  it('should redirect the legacy integration route', async () => {
    const harness = await RouterTestingHarness.create('/integration');
    const router = TestBed.inject(Router);

    expect(router.url).toBe('/integrations');

    expect(harness.routeNativeElement?.querySelector('app-integration')).not.toBeNull();
  });
});
