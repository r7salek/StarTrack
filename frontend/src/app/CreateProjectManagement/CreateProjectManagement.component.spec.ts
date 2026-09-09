import { CreateProjectManagementComponent } from './CreateProjectManagement.component';
import { of, Subject } from 'rxjs';

describe('CreateProjectManagementComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new CreateProjectManagementComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
  it('passes project UUID rather than a potentially shared name to history', () => {
    const dialog = jasmine.createSpyObj('MatDialog', ['open']);
    dialog.open.and.returnValue({ afterClosed: () => new Subject() });
    const component = new CreateProjectManagementComponent({} as any, {} as any,
      {} as any, dialog, {} as any, {} as any);
    component.dataGridInstance = { instance: {
      getSelectedRowsData: () => [{ projectId: 'uuid-a', projectName: 'Shared name' }],
    } } as any;
    component.viewHistory();
    expect(dialog.open.calls.mostRecent().args[1].data.dataKey).toBe('uuid-a');
  });
  it('archives by UUID then reloads an empty latest list after the server succeeds', () => {
    const service = jasmine.createSpyObj('CreateProjectService', ['archiveProject', 'getCreateProjectDataLatest']);
    service.archiveProject.and.returnValue(of(undefined));
    service.getCreateProjectDataLatest.and.returnValue(of([]));
    const notices = jasmine.createSpyObj('NotificationService', ['confirmation', 'success', 'error']);
    notices.confirmation.and.callFake((_text: string, accept: () => void) => accept());
    const component = new CreateProjectManagementComponent(notices, {} as any, service,
      {} as any, { detectChanges: () => {} } as any, {} as any);
    component.dataSource = [{ projectId: 'uuid-a' }];
    component.dataGridInstance = { instance: {
      getSelectedRowsData: () => [{ projectId: 'uuid-a', id: 12 }],
    } } as any;
    component.onDelete();
    expect(service.archiveProject).toHaveBeenCalledWith('uuid-a');
    expect(component.dataSource).toEqual([]);
    expect(notices.confirmation.calls.mostRecent().args[0]).toContain('history will be retained');
  });
  it('keeps archived history read-only in the alternate listing', () => {
    const dialog = jasmine.createSpyObj('MatDialog', ['open']);
    const notices = jasmine.createSpyObj('NotificationService', ['confirmation']);
    const component = new CreateProjectManagementComponent(notices, {} as any,
      {} as any, dialog, {} as any, {} as any);
    component.dataGridInstance = { instance: {
      getSelectedRowsData: () => [{ projectId: 'uuid-a', archived: true }],
    } } as any;
    expect(component.isSelectedArchived()).toBeTrue();
    component.updateProject();
    component.updateStatus();
    component.onDelete();
    expect(dialog.open).not.toHaveBeenCalled();
    expect(notices.confirmation).not.toHaveBeenCalled();
  });
});
