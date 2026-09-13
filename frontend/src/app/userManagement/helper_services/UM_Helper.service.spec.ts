import { Subject } from 'rxjs';
import { UM_HelperService } from './UM_Helper.service';

describe('Account request rejection', () => {
  function setup() {
    const pending = new Subject<void>();
    const users = { deleteUser: jasmine.createSpy().and.returnValue(pending) };
    const notifications = jasmine.createSpyObj('notifications', ['confirmation', 'success', 'error']);
    const helper = new UM_HelperService(users as any, notifications);
    const refreshed = jasmine.createSpy('refreshed');
    helper.reject('pending@test.com', refreshed);
    return { pending, users, notifications, refreshed };
  }
  it('uses explicit rejection wording and does nothing before confirmation', () => {
    const { users, notifications, refreshed } = setup();
    expect(notifications.confirmation.calls.mostRecent().args[0]).toContain('record will be retained');
    expect(notifications.confirmation.calls.mostRecent().args[2]).toBe('Reject account request');
    expect(users.deleteUser).not.toHaveBeenCalled();
    expect(refreshed).not.toHaveBeenCalled();
  });
  it('waits for successful rejection before refreshing the list', () => {
    const { pending, users, notifications, refreshed } = setup();
    notifications.confirmation.calls.mostRecent().args[1]();
    expect(users.deleteUser).toHaveBeenCalledOnceWith('pending@test.com');
    expect(refreshed).not.toHaveBeenCalled();
    pending.next(); pending.complete();
    expect(refreshed).toHaveBeenCalledTimes(1);
    expect(notifications.success).toHaveBeenCalledWith('Account request rejected.');
  });
  it('keeps the request visible and explains a failed rejection', () => {
    const { pending, notifications, refreshed } = setup();
    notifications.confirmation.calls.mostRecent().args[1]();
    pending.error({ status: 500 });
    expect(refreshed).not.toHaveBeenCalled();
    expect(notifications.success).not.toHaveBeenCalled();
    expect(notifications.error).toHaveBeenCalledWith('The account request could not be rejected. Please try again.');
  });
});
