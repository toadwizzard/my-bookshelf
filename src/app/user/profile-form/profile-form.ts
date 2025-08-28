import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-profile-form',
  imports: [],
  host: {
    'class': 'dialog',
  },
  template: `
    <p>
      profile-form works!
    </p>
    <button (click)="dialogRef.close()">close</button>
  `,
  styles: ``
})
export class ProfileForm {
  dialogRef = inject<DialogRef>(DialogRef);
}
