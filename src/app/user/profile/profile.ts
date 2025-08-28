import { Component, inject } from '@angular/core';
import { UserService } from '../user-service';
import { UserInfo } from '../user-info';
import { Dialog } from '@angular/cdk/dialog';
import { ProfileForm } from '../profile-form/profile-form';

@Component({
  selector: 'app-profile',
  imports: [],
  template: `
    <div class="profile-container">
      <div>
        <p>Username:</p>
        <p>{{user?.username}}</p>
      </div>
      <div>
        <p>Email:</p>
        <p>{{user?.email}}</p>
      </div>
      <button class="base-button" (click)="openFormDialog()">Edit</button>
    </div>
  `,
  styleUrl: `profile.css`,
})
export class Profile {
  userService = inject(UserService);
  user: UserInfo | undefined;

  formDialog = inject(Dialog);

  constructor() {
    this.user = this.userService.getUser(1);
  }

  openFormDialog() {
    const dialogRef = this.formDialog.open(ProfileForm);

    dialogRef.closed.subscribe(result => console.log("Dialog closed"));
  }
}
