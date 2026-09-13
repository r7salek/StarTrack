import { EditedUserProfileComponent } from './EditedUserProfile.component';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';

describe('EditedUserProfileComponent', () => {
  it('keeps edits after a failed save and prevents duplicate saves or closing while pending', () => {
    const pending = new Subject<any>();
    const service = { form: new FormBuilder().group({ firstName: ['Alice'] }), updateUserProfile: jasmine.createSpy().and.returnValue(pending) };
    const ref = jasmine.createSpyObj('MatDialogRef', ['close']);
    const component = new EditedUserProfileComponent(service as any, { getUser: () => ({ id: 1 }) } as any, {} as any, ref);
    component.idValue = 1;
    component.updateUserProfile(service.form.value as any);
    component.updateUserProfile(service.form.value as any);
    component.onClose();
    expect(service.updateUserProfile).toHaveBeenCalledTimes(1);
    expect(ref.close).not.toHaveBeenCalled();
    pending.error({ status: 500 });
    expect(component.isSaving).toBeFalse();
    expect(component.error).toContain('try again');
    expect(service.form.value.firstName).toBe('Alice');
  });
  it('creates with the current user', () => {
    const user = { id: 1, roles: ['ROLE_USER'] };
    const component = new EditedUserProfileComponent(
      {} as any, { getUser: () => user } as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
    expect(component.currentUser).toBe(user);
  });
});
