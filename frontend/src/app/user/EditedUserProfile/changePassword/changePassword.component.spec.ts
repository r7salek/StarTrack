import { FormBuilder } from '@angular/forms';
import { ChangePasswordComponent } from './changePassword.component';

describe('ChangePasswordComponent', () => {
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
