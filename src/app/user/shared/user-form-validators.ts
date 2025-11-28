import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchingPasswordsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');
    const error =
      password && passwordConfirm && password.value !== passwordConfirm.value
        ? { fieldError: 'Passwords do not match.' }
        : null;
    control.get('passwordConfirm')?.setErrors(error);
    return error;
  };
}
