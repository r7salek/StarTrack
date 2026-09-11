import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  it('loads the current user from token storage', () => {
    const user = { id: 1, roles: ['ROLE_USER'] };
    const component = new ProfileComponent({ getUser: () => user } as any);
    component.ngOnInit();
    expect(component.currentUser).toBe(user);
  });
});
