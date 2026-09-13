import { CreateProjectHistoryComponent } from './CreateProjectHistory.component';
import { of, Subject } from 'rxjs';

describe('CreateProjectHistoryComponent', () => {
  it('supports loading, failure and retry without displaying a raw server error', () => {
    const pending = new Subject<any>();
    const service = jasmine.createSpyObj('CreateProjectService', ['getCreateProjectDataHistory']);
    service.getCreateProjectDataHistory.and.returnValue(pending);
    const component = new CreateProjectHistoryComponent({} as any, {} as any, service, {} as any, {} as any, { dataKey: 'uuid' });
    component.getProjectDataLatest();
    expect(component.isLoading).toBeTrue();
    pending.error({ message: 'private server detail' });
    expect(component.isLoading).toBeFalse();
    expect(component.error).toContain('try again');
    expect(component.error).not.toContain('private');
    service.getCreateProjectDataHistory.and.returnValue(of([{ versionNumber: 3, createdBy: 12, modifiedBy: 15 }]));
    component.getProjectDataLatest();
    expect(component.error).toBe('');
    expect(component.dataSource[0].modifiedBy).toBe(15);
  });
  it('removes its resize handler and cancels pending history requests on destruction', () => {
    const add = spyOn(window, 'addEventListener').and.callThrough();
    const remove = spyOn(window, 'removeEventListener').and.callThrough();
    const pending = new Subject<any>();
    const service = { getCreateProjectDataHistory: () => pending };
    const component = new CreateProjectHistoryComponent({} as any, {} as any, service as any, {} as any, {} as any, { dataKey: 'uuid' });
    component.ngOnInit();
    const callback = add.calls.mostRecent().args[1];
    component.ngOnDestroy();
    expect(remove).toHaveBeenCalledWith('resize', callback);
    expect(pending.observers.length).toBe(0);
  });
  it('sizes the grid to its rows and viewport rather than fixing it at 800 pixels', () => {
    const component = new CreateProjectHistoryComponent({} as any, {} as any, {} as any, {} as any, {} as any, {});
    expect(parseInt(component.calculateGridHeight(1), 10)).toBeLessThanOrEqual(224);
    expect(parseInt(component.calculateGridHeight(50), 10)).toBeLessThanOrEqual(560);
    expect(component.customDateFormatter('not-a-date')).toBe('');
  });
  it('denies mutation helpers when opened read-only from the approved-user overview', () => {
    const service = jasmine.createSpyObj('CreateProjectService', ['populateForm', 'archiveProject']);
    const notifications = jasmine.createSpyObj('NotificationService', ['confirmation']);
    const dialog = jasmine.createSpyObj('MatDialog', ['open']);
    const component = new CreateProjectHistoryComponent({} as any, notifications, service, dialog, {} as any, { dataKey: 'uuid', readOnly: true });
    component.updateStatus(); component.onDelete();
    expect(service.populateForm).not.toHaveBeenCalled();
    expect(notifications.confirmation).not.toHaveBeenCalled();
    expect(dialog.open).not.toHaveBeenCalled();
  });
  it('creates with isolated collaborators', () => {
    const component = new CreateProjectHistoryComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any, {}
    );
    expect(component).toBeTruthy();
  });
  it('fetches history using the stable UUID passed by the list', () => {
    const service = jasmine.createSpyObj('CreateProjectService', ['getCreateProjectDataHistory']);
    service.getCreateProjectDataHistory.and.returnValue(of([{ projectId: 'uuid', versionNumber: 2 }]));
    const component = new CreateProjectHistoryComponent({} as any, {} as any,
      service, {} as any, {} as any, { dataKey: 'uuid' });
    component.getProjectDataLatest();
    expect(service.getCreateProjectDataHistory).toHaveBeenCalledWith('uuid');
    expect(component.dataSource[0].versionNumber).toBe(2);
  });
});
