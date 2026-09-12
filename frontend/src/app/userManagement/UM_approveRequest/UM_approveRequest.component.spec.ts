import { UM_approveRequestComponent } from './UM_approveRequest.component';
import { of } from 'rxjs';
import { UM_HelperService } from '../helper_services/UM_Helper.service';

describe('UM_approveRequestComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new UM_approveRequestComponent(
      {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
  it('shows only pending accounts, excluding rejected, deactivated and active accounts', () => {
    const users = [
      { email: 'pending@test.com', enabled: false, delete: false },
      { email: 'rejected@test.com', enabled: false, delete: true },
      { email: 'active@test.com', enabled: true, delete: false },
      { email: 'unknown@test.com', enabled: false },
    ];
    const component = new UM_approveRequestComponent(
      { getUserApprovalData: () => of(users) } as any, {} as any, {} as any
    );
    component.getUserApprovalData();
    expect(component.dataSource1.data.map(user => user.email)).toEqual(['pending@test.com']);
  });
  it('refreshes the pending list after confirmed rejection without a page reload', () => {
    const user = { email: 'pending@test.com', enabled: false, delete: false };
    const service = {
      getUserApprovalData: jasmine.createSpy().and.callFake(() => of([{ ...user }])),
      deleteUser: jasmine.createSpy().and.callFake(() => { user.delete = true; return of(undefined); }),
    };
    const notifications = jasmine.createSpyObj('notifications', ['confirmation', 'success', 'error']);
    const helper = new UM_HelperService(service as any, notifications);
    const component = new UM_approveRequestComponent(service as any, notifications, helper);
    component.getUserApprovalData();
    component.rejectAccount(user.email);
    expect(service.deleteUser).not.toHaveBeenCalled();
    expect(component.dataSource1.data.length).toBe(1);
    notifications.confirmation.calls.mostRecent().args[1]();
    expect(service.deleteUser).toHaveBeenCalledOnceWith(user.email);
    expect(component.dataSource1.data).toEqual([]);
    expect(service.getUserApprovalData).toHaveBeenCalledTimes(2);
    expect(notifications.success).toHaveBeenCalledWith('Account request rejected.');
  });
});
