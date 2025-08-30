import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { matchingPasswordsValidator, uniqueUsernameValidator } from '../shared/user-form-validators';
import { UserService } from '../shared/user-service';
import { UserInfo } from '../shared/user-info';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule],
  host: {
    'class': 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    <h2>Edit user data</h2>
    <form [formGroup]="userForm" (submit)="submit()">
      <div class="input-with-error-container">
          <div class="input-container">
            <label for="username">Username:</label>
            <input type="text" id="username" placeholder="Username" formControlName="username">
          </div>
          @if (userForm.get('username')?.hasError('existingUsername') &&
          userForm.get('username')?.touched && userForm.get('username')?.dirty) {
            <p>Username already exists.</p>
          }
        </div>
        <div class="input-container">
          <label for="email">Email:</label>
          <input type="email" id="email" placeholder="Email" formControlName="email">
        </div>
        <div class="input-with-error-container">
          <div class="input-container">
            <label for="oldPassword">Current password:</label>
            <input type="password" id="oldPassword" placeholder="Current password" formControlName="oldPassword">
          </div>
          @if (userForm.get('oldPassword')?.hasError('incorrectPassword') &&
          userForm.get('oldPassword')?.touched && userForm.get('oldPassword')?.dirty) {
            <p>Incorrect password.</p>
          }
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
          @if (userForm.get('passwordConfirm')?.hasError('passwordsNotMatch') &&
          userForm.get('passwordConfirm')?.touched && userForm.get('passwordConfirm')?.dirty) {
            <p>Passwords do not match.</p>
          }
        </div>
      <button class="base-button" type="submit" [disabled]="!userForm.valid">Edit</button>
    </form>
  `,
  styleUrl: `../../shared/form-styles.css`,
})
export class ProfileForm {
  userService = inject(UserService);
  dialogRef = inject<DialogRef>(DialogRef);
  data = inject<{user: UserInfo}>(DIALOG_DATA);

  userForm = new FormGroup({
    username: new FormControl<string>('', [Validators.required, uniqueUsernameValidator(this.userService)]),
    email: new FormControl<string>('', [Validators.email, Validators.required]),
    oldPassword: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>(''),
    passwordConfirm: new FormControl<string>(''),
  }, {validators: matchingPasswordsValidator()});

  constructor() {
    this.userForm.patchValue({
      username: this.data.user.username,
      email: this.data.user.email
    });
  }

  cancel(){
    this.dialogRef.close();
  }

  submit(){
    if(!this.userForm.valid ||
      !this.userForm.value.username ||
      !this.userForm.value.email ||
      !this.userForm.value.oldPassword
    )
      return;
    if(!this.userService.checkPasswordMatches(this.userForm.value.oldPassword)){
      this.userForm.get("oldPassword")?.setErrors({incorrectPassword: true});
      return;
    }
    this.dialogRef.close({
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      password: this.userForm.value.password ?? "",
    });
  }
}
