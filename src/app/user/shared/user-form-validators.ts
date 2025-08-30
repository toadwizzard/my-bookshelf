import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { UserService } from "./user-service";

export function uniqueUsernameValidator(userService: UserService): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const unique = userService.checkUsernameUnique(control.value);
    return unique ? null : {existingUsername: true};
  }
}

export function matchingPasswordsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');
    const error = password && passwordConfirm && password.value !== passwordConfirm.value ?
      {passwordsNotMatch: true} : null;
    control.get('passwordConfirm')?.setErrors(error);
    return error;
  }
}
