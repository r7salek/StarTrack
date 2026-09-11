import { FormBuilder } from '@angular/forms';
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
    expect(name.enabled).toBeTrue();
    name.setValue('Renamed project');
    component.combineData();
    component.storeData();
    expect(append).toHaveBeenCalledWith('stable-uuid', 3,
      jasmine.objectContaining({ projectName: 'Renamed project' }));
    expect(source.projectId).toBe('stable-uuid');
    expect(source.projectName).toBe('Original name');
  });
});

@Component({ template: `<mat-stepper linear>
  <mat-step label="Overview" [completed]="editor.saveSucceeded">Draft</mat-step>
  <mat-step label="Done">Saved</mat-step>
</mat-stepper>` })
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
    fixture.detectChanges();
    const clickDone = () => {
      (fixture.nativeElement.querySelectorAll('mat-step-header')[1] as HTMLElement).click();
      fixture.detectChanges();
    };
    clickDone();
    expect(fixture.componentInstance.stepper.selectedIndex).toBe(0);
    editor.AddToProjectUpdate = { projectName: 'Retain draft' } as any;
    editor.storeData();
    clickDone();
    expect(fixture.componentInstance.stepper.selectedIndex).toBe(0);
    result.error({ status: 409 });
    clickDone();
    expect(fixture.componentInstance.stepper.selectedIndex).toBe(0);
    expect(editor.AddToProjectUpdate.projectName).toBe('Retain draft');
    expect(ref.close).not.toHaveBeenCalled();
  });
});
