import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe iniciar sin un access token', () => {
    expect(service.getAccessToken()).toBeNull();
  });

  it('debe preparar CSRF antes de enviar credenciales', () => {
    service
      .login({
        username: 'usuario_prueba',
        password: 'clave_prueba',
      })
      .subscribe();

    const csrfRequest = httpMock.expectOne('/api/v1/auth/csrf/');

    expect(csrfRequest.request.method).toBe('GET');
    expect(csrfRequest.request.withCredentials).toBe(true);

    csrfRequest.flush(null);

    const loginRequest = httpMock.expectOne('/api/v1/auth/login/');

    expect(loginRequest.request.method).toBe('POST');
    expect(loginRequest.request.withCredentials).toBe(true);

    expect(loginRequest.request.body).toEqual({
      username: 'usuario_prueba',
      password: 'clave_prueba',
    });

    loginRequest.flush({
      access: 'access-token-de-prueba',
    });
  });

  it('debe conservar el access token en memoria', () => {
    service
      .login({
        username: 'usuario_prueba',
        password: 'clave_prueba',
      })
      .subscribe();

    httpMock.expectOne('/api/v1/auth/csrf/').flush(null);

    httpMock.expectOne('/api/v1/auth/login/').flush({
      access: 'token-simulado-123',
    });

    expect(service.getAccessToken()).toBe('token-simulado-123');
  });

  it('debe manejar credenciales incorrectas', () => {
    const receivedErrors: HttpErrorResponse[] = [];

    service
      .login({
        username: 'usuario_prueba',
        password: 'incorrecta',
      })
      .subscribe({
        error: (error: HttpErrorResponse) => {
          receivedErrors.push(error);
        },
      });

    httpMock.expectOne('/api/v1/auth/csrf/').flush(null);

    httpMock.expectOne('/api/v1/auth/login/').flush(
      { detail: 'Credenciales incorrectas' },
      {
        status: 401,
        statusText: 'Unauthorized',
      },
    );

    expect(receivedErrors).toHaveLength(1);
    expect(receivedErrors[0]).toBeInstanceOf(HttpErrorResponse);
    expect(receivedErrors[0]?.status).toBe(401);
    expect(service.getAccessToken()).toBeNull();
  });

  it('no debe enviar el login si falla CSRF', () => {
    const receivedErrors: HttpErrorResponse[] = [];

    service
      .login({
        username: 'usuario_prueba',
        password: 'clave_prueba',
      })
      .subscribe({
        error: (error: HttpErrorResponse) => {
          receivedErrors.push(error);
        },
      });

    httpMock.expectOne('/api/v1/auth/csrf/').flush(
      { detail: 'Error al preparar CSRF' },
      {
        status: 500,
        statusText: 'Internal Server Error',
      },
    );

    httpMock.expectNone('/api/v1/auth/login/');

    expect(receivedErrors).toHaveLength(1);
    expect(receivedErrors[0]?.status).toBe(500);
    expect(service.getAccessToken()).toBeNull();
  });

  it('debe limpiar el token de memoria', () => {
    service
      .login({
        username: 'usuario_prueba',
        password: 'clave_prueba',
      })
      .subscribe();

    httpMock.expectOne('/api/v1/auth/csrf/').flush(null);

    httpMock.expectOne('/api/v1/auth/login/').flush({
      access: 'token-temporal',
    });

    expect(service.getAccessToken()).not.toBeNull();

    service.clearSession();

    expect(service.getAccessToken()).toBeNull();
  });
});
