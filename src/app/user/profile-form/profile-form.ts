import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { matchingPasswordsValidator } from '../shared/user-form-validators';
import { UserService } from '../../services/user-service';
import { UserInfo } from '../../models/user-info';
import { InputWithError } from '../../shared/input-with-error/input-with-error';
import { isFormError } from '../../helpers/form-error';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, InputWithError],
  host: {
    class: 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    <h2>Edit user data</h2>
    <form [formGroup]="userForm" (submit)="submit()">
      <app-input-with-error
        name="username"
        label="Username"
        placeholder="Username"
        type="text"
        [input]="userForm.controls.username"
      />
      <app-input-with-error
        name="email"
        label="Email"
        placeholder="Email"
        type="email"
        [input]="userForm.controls.email"
      />
      <app-input-with-error
        name="old-password"
        label="Current password"
        placeholder="Current password"
        type="password"
        [input]="userForm.controls.oldPassword"
      />
      <app-input-with-error
        name="new-password"
        label="New password"
        placeholder="New password"
        type="password"
        [input]="userForm.controls.password"
      />
      <app-input-with-error
        name="password-confirm"
        label="New password again"
        placeholder="Password again"
        type="password"
        [input]="userForm.controls.passwordConfirm"
      />
      @if(userForm.hasError('formError')){
      <p class="error-msg">
        <span class="material-icons">error</span> {{ errorMsg }}
      </p>
      } @if (loading) {
      <p class="loading">Loading...</p>
      }
      <button class="base-button" type="submit" [disabled]="!userForm.valid">
        Edit
      </button>
    </form>
  `,
  styleUrl: `../../shared/form-styles.css`,
})
export class ProfileForm {
  userService = inject(UserService);
  dialogRef = inject<DialogRef>(DialogRef);
  data = inject<{ user: UserInfo }>(DIALOG_DATA);
  loading = false;
  errorMsg = '';
  isOpen = false;

  userForm = new FormGroup(
    {
      username: new FormControl<string>('', [
        Validators.required,
        // uniqueUsernameValidator(this.userService),
      ]),
      email: new FormControl<string>('', [
        Validators.email,
        Validators.required,
      ]),
      oldPassword: new FormControl<string>('', [Validators.required]),
      password: new FormControl<string>(''),
      passwordConfirm: new FormControl<string>(''),
    },
    { validators: matchingPasswordsValidator() }
  );

  constructor() {
    this.isOpen = true;
    this.userForm.patchValue({
      username: this.data.user.username,
      email: this.data.user.email,
    });
  }

  cancel() {
    this.isOpen = false;
    this.dialogRef.close();
  }

  submit() {
    if (
      !this.userForm.valid ||
      !this.userForm.value.username ||
      !this.userForm.value.email ||
      !this.userForm.value.oldPassword
    )
      return;
    const user = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      oldPassword: this.userForm.value.oldPassword,
      newPassword: this.userForm.value.password
        ? this.userForm.value.password
        : undefined,
    };
    this.loading = true;
    this.userService.updateUser(user).subscribe({
      next: (updatedUser) => {
        this.isOpen = false;
        this.dialogRef.close(updatedUser);
      },
      error: (err) => {
        if (isFormError(err)) {
          err.errors.forEach((error) => {
            this.userForm
              .get(error.field)
              ?.setErrors({ fieldError: error.message });
          });
        } else {
          this.errorMsg = err.message;
          this.userForm.setErrors({ formError: true });
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        if (this.isOpen) this.dialogRef.close();
      },
    });
  }
}
