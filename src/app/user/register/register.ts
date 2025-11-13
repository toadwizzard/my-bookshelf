import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import {
  matchingPasswordsValidator,
  uniqueUsernameValidator,
} from '../shared/user-form-validators';
import { isFormError } from '../../helpers/form-error';
import { InputWithError } from '../../shared/input-with-error/input-with-error';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, InputWithError],
  template: `
    <div class="form-container">
      <h2>Register</h2>
      <form [formGroup]="registerForm" (submit)="submit()">
        <app-input-with-error
          name="username"
          label="Username"
          placeholder="Username"
          type="text"
          [input]="registerForm.controls.username"
        />
        <app-input-with-error
          name="email"
          label="Email"
          placeholder="Email"
          type="email"
          [input]="registerForm.controls.email"
        />
        <app-input-with-error
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          [input]="registerForm.controls.password"
        />
        <app-input-with-error
          name="password-confirm"
          label="Password again"
          placeholder="Password again"
          type="password"
          [input]="registerForm.controls.passwordConfirm"
        />
        @if(registerForm.hasError('formError')){
        <p class="error-msg">
          <span class="material-icons">error</span> {{ errorMsg }}
        </p>
        }
        <button
          type="submit"
          class="base-button"
          [disabled]="!registerForm.valid"
        >
          Register
        </button>
      </form>
    </div>
  `,
  styleUrl: '../../shared/form-styles.css',
})
export class Register {
  userService = inject(UserService);
  authService = inject(AuthService);
  router = inject(Router);
  errorMsg = '';

  registerForm = new FormGroup(
    {
      username: new FormControl<string>('', [
        Validators.required,
        // uniqueUsernameValidator(this.userService),
      ]),
      email: new FormControl<string>('', [
        Validators.email,
        Validators.required,
      ]),
      password: new FormControl<string>('', [Validators.required]),
      passwordConfirm: new FormControl<string>('', [Validators.required]),
    },
    { validators: matchingPasswordsValidator() }
  );

  submit() {
    if (
      !this.registerForm.value.username ||
      !this.registerForm.value.email ||
      !this.registerForm.value.password
    )
      return;
    this.userService
      .register({
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      })
      .subscribe({
        next: (successful) => {
          if (successful) this.router.navigate(['/login']);
        },
        error: (err) => {
          if (isFormError(err)) {
            err.errors.forEach((error) => {
              this.registerForm
                .get(error.field)
                ?.setErrors({ fieldError: error.message });
            });
          } else {
            this.errorMsg = err.message;
            this.registerForm.setErrors({ formError: true });
            console.log(err);
          }
        },
      });
  }
}
