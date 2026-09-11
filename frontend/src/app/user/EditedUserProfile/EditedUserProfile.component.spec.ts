import { EditedUserProfileComponent } from './EditedUserProfile.component';

describe('EditedUserProfileComponent', () => {
  it('creates with the current user', () => {
    const user = { id: 1, roles: ['ROLE_USER'] };
    const component = new EditedUserProfileComponent(
      {} as any, { getUser: () => user } as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
    expect(component.currentUser).toBe(user);
  });
});
