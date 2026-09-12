import { FormBuilder } from '@angular/forms';
import { ChangePasswordComponent } from './changePassword.component';
import { Subject } from 'rxjs';

describe('ChangePasswordComponent', () => {
  it('uses the current account ID and prevents duplicate requests or cancellation while saving', () => {
    const pending = new Subject<any>();
    const service = { updateUserPassword: jasmine.createSpy().and.returnValue(pending) };
    const ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    const component = new ChangePasswordComponent(service as any, { getUser: () => ({ id: 7 }) } as any, {} as any, ref, new FormBuilder());
    component.ngOnInit();
    component.registerForm.setValue({ password: 'synthetic-test', confirmPassword: 'synthetic-test' });
    component.updateUserPassword(component.registerForm.value);
    component.updateUserPassword(component.registerForm.value);
    component.onClose();
    expect(service.updateUserPassword).toHaveBeenCalledTimes(1);
    expect(service.updateUserPassword.calls.mostRecent().args[0]).toBe(7);
    expect(ref.close).not.toHaveBeenCalled();
    pending.error({ status: 500 });
    expect(component.isSaving).toBeFalse();
    expect(component.error).toContain('try again');
  });
  it('creates with the current user', () => {
    const user = { id: 1, roles: ['ROLE_USER'] };
    const component = new ChangePasswordComponent(
      {} as any, { getUser: () => user } as any,
      {} as any, {} as any, new FormBuilder()
    );
    expect(component).toBeTruthy();
    expect(component.currentUser).toBe(user);
  });
});
