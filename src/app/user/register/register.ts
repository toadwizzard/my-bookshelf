import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../shared/user-service';
import { AuthService } from '../shared/auth-service';
import { Router } from '@angular/router';
import { matchingPasswordsValidator, uniqueUsernameValidator } from '../shared/user-form-validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>Register</h2>
      <form [formGroup]="registerForm" (submit)="submit()">
        <div class="input-with-error-container">
          <div class="input-container">
            <label for="username">Username:</label>
            <input type="text" id="username" placeholder="Username" formControlName="username">
          </div>
          @if (registerForm.get('username')?.hasError('existingUsername') &&
          registerForm.get('username')?.touched && registerForm.get('username')?.dirty) {
            <p>Username already exists.</p>
          }
        </div>
        <div class="input-container">
          <label for="email">Email:</label>
          <input type="email" id="email" placeholder="Email" formControlName="email">
        </div>
        <div class="input-container">
          <label for="password">Password:</label>
          <input type="password" id="password" placeholder="Password" formControlName="password">
        </div>
        <div class="input-with-error-container">
          <div class="input-container">
            <label for="password-confirm">Password again:</label>
            <input type="password" id="password-confirm" placeholder="Password again" formControlName="passwordConfirm">
          </div>
          @if (registerForm.get('passwordConfirm')?.hasError('passwordsNotMatch') &&
          registerForm.get('passwordConfirm')?.touched && registerForm.get('passwordConfirm')?.dirty) {
            <p>Passwords do not match.</p>
          }
        </div>
        <button type="submit" class="base-button" [disabled]="!registerForm.valid">Register</button>
      </form>
    </div>
  `,
  styleUrl: "../../shared/form-styles.css"
})
export class Register {
  userService = inject(UserService);
  authService = inject(AuthService);
  router = inject(Router);

  registerForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required, uniqueUsernameValidator(this.userService)]),
    email: new FormControl<string>('', [Validators.email, Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
    passwordConfirm: new FormControl<string>('', [Validators.required]),
  }, {validators: matchingPasswordsValidator()});

  submit(){
    if(!this.registerForm.value.username ||
      !this.registerForm.value.email ||
      !this.registerForm.value.password)
      return;
    const userId = this.userService.register({
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    });
    this.authService.setId(userId);
    this.router.navigate(['/']);
  }
}
