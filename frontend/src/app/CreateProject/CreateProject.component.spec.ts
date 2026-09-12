import { FormBuilder, Validators } from '@angular/forms';
import { CreateProjectComponent } from './CreateProject.component';
import { Subject } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateProjectComponent', () => {
  it('creates with isolated collaborators', () => {
    const dateAdapter = jasmine.createSpyObj('DateAdapter', ['setLocale']);
    const component = new CreateProjectComponent(
      new FormBuilder(), {} as any, {} as any,
      { getUser: () => ({ id: 1, roles: ['ROLE_USER'] }) } as any,
      {} as any, dateAdapter, {} as any
    );
    expect(component).toBeTruthy();
    expect(dateAdapter.setLocale).toHaveBeenCalledWith('en-de');
  });
  it('waits for a successful create before displaying the done step', () => {
    const result = new Subject<any>();
    const service = jasmine.createSpyObj('CreateProjectService', ['createProject']);
    service.createProject.and.returnValue(result);
    const notices = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const component = new CreateProjectComponent(new FormBuilder(), { detectChanges: () => {} } as any, notices,
      { getUser: () => ({ id: 1 }) } as any, service,
      { setLocale: () => {} } as any, {} as any);
    const stepper = jasmine.createSpyObj('MatStepper', ['next']);
    component.stepper = stepper;
    component.AddToProjectUpdate = { projectName: 'Draft' } as any;
    spyOn(component, 'prepareSave').and.returnValue(true); // Isolate the delayed request boundary.
    component.storeData();
    component.storeData();
    expect(service.createProject).toHaveBeenCalledTimes(1);
    expect(stepper.next).not.toHaveBeenCalled();
    result.next({ projectId: 'uuid', versionNumber: 1 });
    expect(stepper.next).toHaveBeenCalledTimes(1);
    expect(component.isSaving).toBeFalse();
  });
  it('keeps a failed create draft and never displays success', () => {
    const result = new Subject<any>();
    const service = { createProject: () => result };
    const notices = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    const component = new CreateProjectComponent(new FormBuilder(), {} as any, notices,
      { getUser: () => ({ id: 1 }) } as any, service as any,
      { setLocale: () => {} } as any, {} as any);
    const draft = { projectName: 'Retained draft' } as any;
    component.AddToProjectUpdate = draft;
    spyOn(component, 'prepareSave').and.returnValue(true);
    component.stepper = jasmine.createSpyObj('MatStepper', ['next']);
    component.storeData();
    result.error({ status: 400 });
    expect(component.AddToProjectUpdate).toBe(draft);
    expect(component.stepper!.next).not.toHaveBeenCalled();
    expect(notices.success).not.toHaveBeenCalled();
    expect(component.isSaving).toBeFalse();
  });

  it('refreshes review and saves current fields rather than a previous review snapshot', () => {
    const result = new Subject<any>();
    const createProject = jasmine.createSpy().and.returnValue(result);
    const component = new CreateProjectComponent(new FormBuilder(), { detectChanges: () => {} } as any,
      jasmine.createSpyObj('Notice', ['success', 'error']), { getUser: () => ({ id: 1 }) } as any,
      { createProject } as any, { setLocale: () => {} } as any, {} as any);
    component.ngOnInit();
    component.form1.get('collaborationRows').at(0).get('collaboration').setValue(['Synthetic collaboration']);
    component.form.patchValue({ projectName: 'Old review', otherInforPI: 'Old optional text' });
    component.onStepChanged(6);
    expect(component.AddToProjectUpdate.projectName).toBe('Old review');
    component.form.patchValue({ projectName: 'Current entry', otherInforPI: '' });
    component.storeData();
    expect(createProject).toHaveBeenCalledWith(jasmine.objectContaining({ projectName: 'Current entry', otherInforPI: '' }));
    expect(component.isSaving).toBeTrue();
    component.storeData();
    expect(createProject).toHaveBeenCalledTimes(1);
    result.error({ status: 400 });
    expect(component.isSaving).toBeFalse();
    expect(component.form.value.projectName).toBe('Current entry');
    component.form.get('projectName').setValidators(Validators.required);
    component.form.get('projectName').setValue('');
    component.storeData();
    expect(createProject).toHaveBeenCalledTimes(1);
    expect(component.form.get('projectName').touched).toBeTrue();
  });
});

@Component({ template: `
  <p role="status">{{editor.isSaving ? 'Saving project. Editing is paused.' : ''}}</p>
  <div [attr.inert]="editor.isSaving ? '' : null" [attr.aria-busy]="editor.isSaving">
  <mat-stepper linear #steps
    (selectionChange)="$event.selectedIndex < steps.steps.length - 1 && editor.beginDraft()">
    <mat-step label="Overview" [completed]="editor.saveSucceeded">Draft</mat-step>
    <mat-step label="Done">Saved</mat-step>
  </mat-stepper></div>` })
class CreateCompletionHost {
  @ViewChild(MatStepper) stepper!: MatStepper;
  editor!: CreateProjectComponent;
}

describe('Create project Material completion boundary', () => {
  it('blocks header bypass before/during/after a failed save and resets for repeat creation', () => {
    TestBed.configureTestingModule({ declarations: [CreateCompletionHost],
      imports: [MatStepperModule, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(CreateCompletionHost);
    let response = new Subject<any>();
    const editor = new CreateProjectComponent(new FormBuilder(),
      { detectChanges: () => fixture.detectChanges() } as any,
      jasmine.createSpyObj('Notice', ['success', 'error']),
      { getUser: () => ({ id: 1 }) } as any,
      { createProject: () => response } as any, { setLocale: () => {} } as any, {} as any);
    fixture.componentInstance.editor = editor;
    spyOn(editor, 'prepareSave').and.returnValue(true); // This host isolates Material completion behavior.
    fixture.detectChanges();
    editor.stepper = fixture.componentInstance.stepper;
    const clickDone = () => {
      (fixture.nativeElement.querySelectorAll('mat-step-header')[1] as HTMLElement).click();
      fixture.detectChanges();
    };
    editor.AddToProjectUpdate = { projectName: 'First draft' } as any;
    clickDone();
    expect(editor.stepper.selectedIndex).toBe(0);
    editor.storeData();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').hasAttribute('inert')).toBeTrue();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Saving project');
    clickDone();
    expect(editor.stepper.selectedIndex).toBe(0);
    response.error({ status: 400 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').hasAttribute('inert')).toBeFalse();
    clickDone();
    expect(editor.stepper.selectedIndex).toBe(0);
    response = new Subject<any>();
    editor.storeData();
    response.next({ projectId: 'first', versionNumber: 1 });
    fixture.detectChanges();
    expect(editor.stepper.selectedIndex).toBe(1);
    editor.stepper.previous();
    fixture.detectChanges();
    expect(editor.saveSucceeded).toBeFalse();
    clickDone();
    expect(editor.stepper.selectedIndex).toBe(0);
    editor.AddToProjectUpdate = { projectName: 'Second draft' } as any;
    response = new Subject<any>();
    editor.storeData();
    response.next({ projectId: 'second', versionNumber: 1 });
    fixture.detectChanges();
    expect(editor.stepper.selectedIndex).toBe(1);
  });
});
