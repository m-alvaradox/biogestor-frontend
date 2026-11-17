
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Login } from './login';
import { AuthService } from '../../../../core/auth/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: {
    login: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authService = {
      login: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    await fixture.whenStable();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe impedir el envío con campos vacíos', () => {
    component.onSubmit();

    expect(component.loginForm.invalid).toBe(true);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('debe permitir mostrar y ocultar la contraseña', () => {
    expect(component.showPassword()).toBe(false);

    component.togglePassword();
    expect(component.showPassword()).toBe(true);

    component.togglePassword();
    expect(component.showPassword()).toBe(false);
  });

  it('debe enviar las credenciales correctas', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.loginForm.setValue({
      username: 'usuario_prueba',
      password: 'clave_prueba',
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'usuario_prueba',
      password: 'clave_prueba',
    });
  });

  it('debe mostrar el estado de carga', () => {
    const pending = new Subject<void>();
    authService.login.mockReturnValue(pending.asObservable());

    component.loginForm.setValue({
      username: 'usuario_prueba',
      password: 'clave_prueba',
    });

    component.onSubmit();

    expect(component.isLoading()).toBe(true);
    expect(component.loginForm.disabled).toBe(true);

    pending.complete();

    expect(component.isLoading()).toBe(false);
    expect(component.loginForm.enabled).toBe(true);
  });

  it('debe mostrar un error de autenticación', () => {
    authService.login.mockReturnValue(
      throwError(
        () => new HttpErrorResponse({ status: 401 }),
      ),
    );

    component.loginForm.setValue({
      username: 'usuario_prueba',
      password: 'clave_incorrecta',
    });

    component.onSubmit();

    expect(component.authError()).toBe(
      'Usuario o contraseña incorrectos.',
    );
    expect(component.isLoading()).toBe(false);
  });
});
