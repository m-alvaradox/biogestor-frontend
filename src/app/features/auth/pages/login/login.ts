
import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly showPassword = signal(false);
  readonly submitted = signal(false);

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
    this.submitted.set(true);
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      return;
    }

    // La integración con AuthService se implementará
    // en el siguiente paso.
  }
}
