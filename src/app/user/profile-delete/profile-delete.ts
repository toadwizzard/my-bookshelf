import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user-service';
import { DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-delete',
  imports: [],
  host: {
    class: 'dialog',
  },
  template: `
    <button (click)="cancel()" class="close">X</button>
    @if(loading){
    <p class="loading">Loading...</p>
    } @else if (isError) {
    <p class="error-msg">
      <span class="material-icons">error</span> {{ errorMsg }}
    </p>
    <button (click)="cancel()" class="base-button">OK</button>
    } @else {
    <p>
      Are you sure you want to delete your profile? (This action cannot be
      undone.)
    </p>
    <button (click)="delete()" class="base-button red">Delete</button>
    }
  `,
  styles: `
    p {
      text-align: center;
      font-weight: bold;
      margin-top: 30px;
    }
    button {
      display: block;
      margin: 0 auto;
    }
  `,
  styleUrl: '../../shared/form-styles.css',
})
export class ProfileDelete {
  userService = inject(UserService);
  dialogRef = inject<DialogRef>(DialogRef);
  router = inject(Router);
  isOpen = false;
  isError = false;
  errorMsg = '';
  loading = false;

  constructor() {
    this.isOpen = true;
  }

  cancel() {
    this.isOpen = false;
    this.dialogRef.close();
  }

  delete() {
    this.loading = true;
    this.userService.deleteUser().subscribe({
      next: (value) => {
        this.isOpen = false;
        this.dialogRef.close();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isError = true;
        this.errorMsg = 'An error occurred: ' + err.message;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        if (this.isOpen) {
          this.isError = true;
          this.errorMsg =
            'Could not delete profile: login expired (log in and try again).';
        }
      },
    });
  }
}
