import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FocusInvalidDirective } from './focus-invalid.directive';

@Component({ template: '<form stFocusInvalid><input name="first" ngModel required><input name="second" ngModel required><button type="submit">Submit</button><button type="button" matStepperNext><span>Next</span></button></form>' })
class FormHost {}

describe('FocusInvalidDirective', () => {
  it('focuses and touches invalid fields when a non-submit Next button is clicked', async () => {
    await TestBed.configureTestingModule({ declarations: [FormHost, FocusInvalidDirective], imports: [FormsModule] }).compileComponents();
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLElement>('button[matStepperNext] span')!.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(element.querySelector('input'));
    expect(element.querySelector('input')!.classList.contains('ng-touched')).toBeTrue();
  });
  it('focuses the first invalid input when the rendered form is submitted', async () => {
    await TestBed.configureTestingModule({ declarations: [FormHost, FocusInvalidDirective], imports: [FormsModule] }).compileComponents();
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector('button')!.click();
    expect(document.activeElement).toBe(element.querySelector('input'));
  });
});
