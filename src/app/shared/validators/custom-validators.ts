import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const arrayNotEmptyValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (Array.isArray(value) && value.length > 0) {
    return null;
  }
  return { required: true };
};
