import { AbstractControl, ValidationErrors } from '@angular/forms';

export function minSelectedCheckboxes(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value.length >= min ? null : { minlength: true };
  };
}
