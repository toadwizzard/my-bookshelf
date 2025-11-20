import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="form-container">
        <h2>Log in</h2>
        <form [formGroup]="loginForm" (submit)="submit()">
          <div class="input-container">
            <label for="username">Username:</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              formControlName="username"
            />
          </div>
          <div class="input-container">
            <label for="password">Password:</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              formControlName="password"
            />
          </div>
          @if(loginForm.hasError('invalidCredentials')){
          <p class="error-msg">
            <span class="material-icons">error</span> {{ errorMsg }}
          </p>
          } @if (loading) {
          <p class="loading">Loading...</p>
          }
          <button
            type="submit"
            class="base-button"
            [disabled]="!loginForm.valid"
          >
            Login
          </button>
        </form>
      </div>
      <p>Don't have an account yet? <a routerLink="/register">Sign up</a></p>
    </div>
  `,
  styleUrl: '../../shared/form-styles.css',
  styles: `
    .login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .login-container > p {
      color: var(--accent-color);
    }
    .login-container > p a {
      color: var(--accent-color);
    }
    .login-container > p a:hover {
      color: var(--accent-hover);
    }
  `,
})
export class Login {
  userService = inject(UserService);
  authService = inject(AuthService);
  router = inject(Router);
  errorMsg: string = '';
  loading = false;

  loginForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
  });

  submit() {
    if (!this.loginForm.value.username || !this.loginForm.value.password) {
      this.loginForm.setErrors({ invalidCredentials: true });
      return;
    }
    this.loading = true;
    this.userService
      .login({
        username: this.loginForm.value.username,
        password: this.loginForm.value.password,
      })
      .subscribe({
        next: (res) => {
          if (res) this.router.navigate(['/']);
          else {
            this.errorMsg = 'Something went wrong while logging in.';
            this.loginForm.setErrors({ invalidCredentials: true });
          }
        },
        error: (err) => {
          this.errorMsg = err.message;
          this.loginForm.setErrors({ invalidCredentials: true });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
