export class FormError {
  isFormError = true;
  message: string = '';
  errors: {
    message: string;
    field: string;
  }[] = [];

  constructor(message: string, errors: { message: string; field: string }[]) {
    this.message = message;
    this.errors = errors;
  }
}

export function isFormError(error: any): error is FormError {
  return error.isFormError;
}
