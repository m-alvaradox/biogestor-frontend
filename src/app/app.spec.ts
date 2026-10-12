import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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

    expect(
      harness.routeNativeElement?.querySelector('h1')?.textContent,
    ).toContain('Panel principal');

    expect(
      harness.routeNativeElement?.querySelectorAll('app-stat-card').length,
    ).toBe(4);
  });
});
