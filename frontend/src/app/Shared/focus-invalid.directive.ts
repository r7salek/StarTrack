import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { ControlContainer } from '@angular/forms';

/** Keep keyboard users at the field that needs correction after a failed submit. */
@Directive({ selector: 'form[stFocusInvalid]' })
export class FocusInvalidDirective {
  constructor(private element: ElementRef<HTMLFormElement>,
    @Optional() @Self() private control?: ControlContainer) {}

  @HostListener('click', ['$event']) onNext(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('button[matStepperNext]')) this.focusFirstInvalid();
  }

  @HostListener('submit') focusFirstInvalid(): void {
    this.control?.control?.markAllAsTouched();
    this.element.nativeElement.querySelector<HTMLElement>(
      'input.ng-invalid, textarea.ng-invalid, select.ng-invalid, mat-select.ng-invalid'
    )?.focus();
  }
}
