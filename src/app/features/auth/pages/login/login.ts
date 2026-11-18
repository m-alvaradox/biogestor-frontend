import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly submitted = signal(false);
  readonly isLoading = signal(false);
  readonly authError = signal<string | null>(null);

  readonly loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    this.submitted.set(true);
    this.authError.set(null);
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.loginForm.disable();

    const credentials = this.loginForm.getRawValue();

    this.authService
      .login(credentials)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.loginForm.enable();
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/dashboard']);
        },
        error: (error: HttpErrorResponse) => {
          this.authError.set(this.getErrorMessage(error));
        },
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'No se pudo conectar con el servidor. Inténtalo nuevamente.';

      case 400:
      case 401:
        return 'Usuario o contraseña incorrectos.';

      case 403:
        return 'No se pudo validar la solicitud. Inténtalo nuevamente.';

      case 429:
        return 'Demasiados intentos. Inténtalo más tarde.';

      default:
        return 'Ocurrió un error al iniciar sesión. Inténtalo nuevamente.';
    }
  }
}
