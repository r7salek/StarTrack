import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { UpdateProjectComponent } from './updateProject.component';
import { of, Subject, throwError } from 'rxjs';
import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateProjectService } from '../../services/CreateProject.service';

describe('UpdateProjectComponent', () => {
  it('creates with isolated collaborators', () => {
    const dateAdapter = jasmine.createSpyObj('DateAdapter', ['setLocale']);
    const component = new UpdateProjectComponent(
      {} as any, {} as any, {} as any, {} as any,
      { getUser: () => ({ id: 1, roles: ['ROLE_USER'] }) } as any,
      {} as any, dateAdapter, {}, new FormBuilder()
    );
    expect(component).toBeTruthy();
    expect(dateAdapter.setLocale).toHaveBeenCalledWith('en-de');
  });

  function editor(result: any, source = { projectId: 'project-uuid', versionNumber: 3 }) {
    const service = jasmine.createSpyObj('CreateProjectService', ['appendProjectVersion']);
    service.appendProjectVersion.and.returnValue(result);
    const notices = jasmine.createSpyObj('NotificationService', ['error', 'success']);
    const ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    const component = new UpdateProjectComponent(ref, notices, {} as any, service,
      { getUser: () => ({ id: 1 }) } as any, {} as any,
      { setLocale: () => {} } as any, { dataKey: source }, new FormBuilder());
    component.AddToProjectUpdate = { projectName: 'Unsaved rename' } as any;
    component.loading = false; // This helper exercises already-initialised save behavior.
    spyOn(component, 'prepareSave').and.returnValue(true);
    return { component, service, notices, ref };
  }

  it('retains the entered form and open dialog on a stale-version conflict', () => {
    const { component, service, notices, ref } = editor(throwError(() => ({ status: 409 })));
    const draft = component.AddToProjectUpdate;
    component.storeData();
    expect(service.appendProjectVersion).toHaveBeenCalledWith('project-uuid', 3, draft);
    expect(component.AddToProjectUpdate).toBe(draft);
    expect(ref.close).not.toHaveBeenCalled();
    expect(notices.error).toHaveBeenCalledWith(jasmine.stringMatching('nothing was overwritten'));
  });

  it('closes after a successful appended snapshot so the latest list reloads', () => {
    const { component, ref } = editor(of({ versionNumber: 4 }));
    component.storeData();
    expect(ref.close).toHaveBeenCalledWith(true);
  });

  it('refuses to save an edit without stable identity and version', () => {
    const { component, service, notices } = editor(of({}), {} as any);
    component.storeData();
    expect(service.appendProjectVersion).not.toHaveBeenCalled();
    expect(notices.error).toHaveBeenCalled();
  });
  it('does not send duplicate save requests while a version is being stored', () => {
    const { component, service } = editor(new Subject());
    component.storeData();
    component.storeData();
    expect(service.appendProjectVersion).toHaveBeenCalledTimes(1);
    expect(component.isSaving).toBeTrue();
  });
  it('appends the edited name while retaining project UUID and expected version', () => {
    const service = new CreateProjectService({} as any);
    const append = spyOn(service, 'appendProjectVersion').and.returnValue(new Subject());
    const source = { projectId: 'stable-uuid', versionNumber: 3, projectName: 'Original name' };
    const component = new UpdateProjectComponent({} as any,
      jasmine.createSpyObj('Notice', ['success', 'error']), {} as any, service,
      { getUser: () => ({ id: 1 }) } as any, { detectChanges: () => {} } as any,
      { setLocale: () => {} } as any, { dataKey: source }, new FormBuilder());
    const name = service.form.get('projectName')!;
    (service.form1.get('collaborationRows') as FormArray).clear();
    (service.form2.get('outputRows') as FormArray).clear();
    (service.form2.get('fundingRows') as FormArray).clear();
    component.loading = false;
    expect(name.enabled).toBeTrue();
    name.setValue('Renamed project');
    component.combineData();
    component.storeData();
    expect(append).toHaveBeenCalledWith('stable-uuid', 3,
      jasmine.objectContaining({ projectName: 'Renamed project' }));
    expect(source.projectId).toBe('stable-uuid');
    expect(source.projectName).toBe('Original name');
  });

  it('refreshes review, validates all forms and collects the current draft at Save', () => {
    const service = new CreateProjectService({} as any);
    const result = new Subject<any>();
    const append = spyOn(service, 'appendProjectVersion').and.returnValue(result);
    (service.form1.get('collaborationRows') as FormArray).clear();
    (service.form2.get('outputRows') as FormArray).clear();
    (service.form2.get('fundingRows') as FormArray).clear();
    const component = new UpdateProjectComponent({ close: jasmine.createSpy() } as any,
      jasmine.createSpyObj('Notice', ['success', 'error']), {} as any, service,
      { getUser: () => ({ id: 1 }) } as any, { detectChanges: () => {} } as any,
      { setLocale: () => {} } as any, { dataKey: { projectId: 'stable', versionNumber: 4 } }, new FormBuilder());
    component.loading = false;
    service.form.patchValue({ projectName: 'Reviewed name', otherInforPI: 'Old text' });
    component.onStepChanged(6);
    expect(component.AddToProjectUpdate.projectName).toBe('Reviewed name');
    service.form.patchValue({ projectName: 'Current name', otherInforPI: '' });
    component.storeData();
    expect(append).toHaveBeenCalledWith('stable', 4, jasmine.objectContaining({ projectName: 'Current name', otherInforPI: '' }));
    expect(component.isSaving).toBeTrue();
    component.storeData();
    expect(append).toHaveBeenCalledTimes(1);
    result.error({ status: 409 });
    expect(component.isSaving).toBeFalse();
    expect(service.form.value.projectName).toBe('Current name');
    service.form3.get('projectBackground')!.setValidators(Validators.required);
    service.form3.get('projectBackground')!.setValue('');
    component.storeData();
    expect(append).toHaveBeenCalledTimes(1);
    expect(service.form3.get('projectBackground')!.touched).toBeTrue();
  });
});

describe('Update project initialisation boundary', () => {
  const methods = ['getGroupMemberById', 'getOutputById', 'getCollaborationById',
    'getExternalAdvisorById', 'getsubcontractorById', 'getppiById', 'getotrById',
    'getFundingById', 'getFundingOverviewById'] as const;

  function pendingEditor() {
    const service = new CreateProjectService({} as any);
    const streams = methods.map(() => new Subject<any[]>());
    const spies = methods.map((method, index) => spyOn(service, method).and.returnValue(streams[index]));
    const append = spyOn(service, 'appendProjectVersion').and.returnValue(of({ versionNumber: 2 } as any));
    const ref = jasmine.createSpyObj('Dialog', ['close']);
    const component = new UpdateProjectComponent(ref,
      jasmine.createSpyObj('Notice', ['success', 'error']), {} as any, service,
      { getUser: () => ({ id: 1 }) } as any, { detectChanges: () => {} } as any,
      { setLocale: () => {} } as any,
      { dataKey: { projectId: 'project', versionNumber: 1 } }, new FormBuilder());
    component.ngOnInit();
    component.AddToProjectUpdate = { projectName: 'Loaded snapshot' } as any;
    return { component, service, streams, spies, append, ref };
  }

  it('blocks save and form initialisation until all nine reads succeed', () => {
    const { component, streams, append } = pendingEditor();
    const initialize = spyOn(component, 'initializeGroupMemberRows').and.callThrough();
    streams.slice(0, 8).forEach(stream => { stream.next([]); stream.complete(); });
    component.storeData();
    expect(component.loading).toBeTrue();
    expect(initialize).not.toHaveBeenCalled();
    expect(append).not.toHaveBeenCalled();
    streams[8].next([]);
    streams[8].complete();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBe('');
    expect(component.hasUnsavedChanges).toBeFalse();
    expect(initialize).toHaveBeenCalledTimes(1);
    component.storeData();
    expect(append).toHaveBeenCalledTimes(1);
    component.ngOnDestroy();
  });

  it('shows failure, cancels remaining reads, and retries without partial initialization', () => {
    const { component, streams, spies, append } = pendingEditor();
    streams[0].error({ status: 500 });
    expect(component.loading).toBeFalse();
    expect(component.loadError).toContain('could not be loaded');
    expect(streams.every(stream => !stream.observed)).toBeTrue();
    component.storeData();
    expect(append).not.toHaveBeenCalled();
    spies.forEach(spy => spy.and.returnValue(of([])));
    component.retryLoad();
    expect(component.loading).toBeFalse();
    expect(component.loadError).toBe('');
    component.ngOnDestroy();
  });

  it('does not retry over a changed draft and cancels loading when the closed editor is destroyed', async () => {
    const { component, service, streams, spies } = pendingEditor();
    streams[0].error({ status: 500 });
    service.form.markAsDirty();
    component.retryLoad();
    expect(spies[0]).toHaveBeenCalledTimes(1);
    component.ngOnDestroy();
    const pending = pendingEditor();
    await pending.component.onClose();
    expect(pending.ref.close).toHaveBeenCalled();
    expect(pending.streams.every(stream => !stream.observed)).toBeTrue();
    pending.component.ngOnDestroy();
    expect(pending.streams.every(stream => !stream.observed)).toBeTrue();
    pending.component.storeData();
    expect(pending.append).not.toHaveBeenCalled();
  });
});

@Component({ template: `<p role="status">{{editor.isSaving ? 'Saving version. Editing is paused.' : ''}}</p>
<div [attr.inert]="editor.isSaving ? '' : null" [attr.aria-busy]="editor.isSaving"><mat-stepper linear>
  <mat-step label="Overview" [completed]="editor.saveSucceeded">Draft</mat-step>
  <mat-step label="Done">Saved</mat-step>
</mat-stepper></div>` })
class UpdateCompletionHost {
  @ViewChild(MatStepper) stepper!: MatStepper;
  editor!: UpdateProjectComponent;
}

describe('Update project Material completion boundary', () => {
  it('blocks Done header before saving and after a stale conflict', () => {
    TestBed.configureTestingModule({ declarations: [UpdateCompletionHost],
      imports: [MatStepperModule, NoopAnimationsModule] });
    const fixture = TestBed.createComponent(UpdateCompletionHost);
    const result = new Subject<any>();
    const ref = jasmine.createSpyObj('Dialog', ['close']);
    const editor = new UpdateProjectComponent(ref,
      jasmine.createSpyObj('Notice', ['success', 'error']), {} as any,
      { appendProjectVersion: () => result } as any,
      { getUser: () => ({ id: 1 }) } as any, {} as any,
      { setLocale: () => {} } as any,
      { dataKey: { projectId: 'project', versionNumber: 1 } }, new FormBuilder());
    fixture.componentInstance.editor = editor;
    spyOn(editor, 'prepareSave').and.returnValue(true); // This host isolates Material completion behavior.
    fixture.detectChanges();
    const clickDone = () => {
      (fixture.nativeElement.querySelectorAll('mat-step-header')[1] as HTMLElement).click();
      fixture.detectChanges();
    };
    clickDone();
    expect(fixture.componentInstance.stepper.selectedIndex).toBe(0);
    editor.AddToProjectUpdate = { projectName: 'Retain draft' } as any;
    editor.loading = false;
    editor.storeData();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').hasAttribute('inert')).toBeTrue();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Saving version');
    clickDone();
    expect(fixture.componentInstance.stepper.selectedIndex).toBe(0);
    result.error({ status: 409 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').hasAttribute('inert')).toBeFalse();
    clickDone();
    expect(fixture.componentInstance.stepper.selectedIndex).toBe(0);
    expect(editor.AddToProjectUpdate.projectName).toBe('Retain draft');
    expect(ref.close).not.toHaveBeenCalled();
  });
});
