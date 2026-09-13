import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CreateProjectComponent } from '../CreateProject/CreateProject.component';
import { UpdateProjectComponent } from '../CreateProjectManagement/updateProject/updateProject.component';
import { CreateProjectService } from './CreateProject.service';
import { ToolbarComponent } from '../core/toolbar/toolbar.component';
import { Subject } from 'rxjs';

@Component({ template: '<form [formGroup]="editor.form"><input formControlName="projectName"></form>' })
class CreateDraftHost {
  editor = new CreateProjectComponent(new FormBuilder(), { detectChanges: () => {} } as any,
    {} as any, { getUser: () => ({ id: 1 }) } as any, {} as any,
    { setLocale: () => {} } as any, {} as any);
  constructor() { this.editor.ngOnInit(); }
}

describe('Project draft boundaries', () => {
  it('ignores programmatic initialisation normalisation but protects rendered user input', () => {
    TestBed.configureTestingModule({ declarations: [CreateDraftHost], imports: [ReactiveFormsModule] });
    const fixture = TestBed.createComponent(CreateDraftHost);
    fixture.detectChanges();
    const editor = fixture.componentInstance.editor;
    // Control value accessors may normalise empty values after initialisation.
    editor.form.patchValue({ projectName: null });
    editor.form3.patchValue({ readiness: null });
    fixture.detectChanges();
    expect(editor.hasUnsavedChanges).toBeFalse();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'A real user edit';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(editor.hasUnsavedChanges).toBeTrue();
    expect(editor.form.value.projectName).toBe('A real user edit');
  });

  it('detects create field and repeat-row changes without mistaking defaults for edits', () => {
    const editor = new CreateProjectComponent(new FormBuilder(), { detectChanges: () => {} } as any,
      {} as any, { getUser: () => ({ id: 1 }) } as any, {} as any,
      { setLocale: () => {} } as any, {} as any);
    editor.ngOnInit();
    expect(editor.hasUnsavedChanges).toBeFalse();
    editor.addgroupMember();
    expect(editor.hasUnsavedChanges).toBeTrue();
    editor.saveSucceeded = true;
    expect(editor.hasUnsavedChanges).toBeFalse();
    editor.beginDraft();
    expect(editor.hasUnsavedChanges).toBeTrue();
    const event = { preventDefault: jasmine.createSpy(), returnValue: undefined } as any;
    editor.protectBrowserExit(event);
    expect(event.preventDefault).toHaveBeenCalled();
    editor.saveSucceeded = true;
    editor.isSaving = true;
    event.preventDefault.calls.reset();
    editor.protectBrowserExit(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('counts update repeat-row changes and only closes after discard approval', async () => {
    const service = new CreateProjectService({} as any);
    const editor = Object.create(UpdateProjectComponent.prototype) as any;
    editor.destroyed = new Subject<void>();
    editor.createProjectService = service;
    editor.dialogRef = { close: jasmine.createSpy() };
    editor.drafts = { confirmLeave: () => Promise.resolve(false) };
    expect(editor.hasUnsavedChanges).toBeFalse();
    service.addgroupMember();
    expect(editor.hasUnsavedChanges).toBeTrue();
    await editor.onClose();
    expect(editor.dialogRef.close).not.toHaveBeenCalled();
    editor.drafts.confirmLeave = () => Promise.resolve(true);
    editor.isSaving = true;
    await editor.onClose();
    expect(editor.dialogRef.close).not.toHaveBeenCalled();
    editor.isSaving = false;
    await editor.onClose();
    expect(editor.dialogRef.close).toHaveBeenCalledTimes(1);
    editor.saveSucceeded = true;
    expect(editor.hasUnsavedChanges).toBeFalse();
  });

  it('does not clear the session when sign-out discard is cancelled', async () => {
    const storage = { getToken: () => null, getUser: () => null, signOut: jasmine.createSpy() };
    const drafts = { confirmLeave: () => Promise.resolve(false), releaseForSignOut: jasmine.createSpy() };
    const toolbar = new ToolbarComponent(storage as any, {} as any, {} as any, drafts as any);
    await toolbar.logout();
    expect(storage.signOut).not.toHaveBeenCalled();
    expect(drafts.releaseForSignOut).not.toHaveBeenCalled();
    drafts.confirmLeave = () => Promise.resolve(true);
    await toolbar.logout();
    expect(drafts.releaseForSignOut).toHaveBeenCalledTimes(1);
    expect(storage.signOut).toHaveBeenCalledTimes(1);
  });
});
