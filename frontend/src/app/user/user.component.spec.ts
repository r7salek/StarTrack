import { UserComponent } from './user.component';

describe('UserComponent', () => {
  it('creates with the current user without issuing an HTTP request', () => {
    const user = { id: 1, roles: ['ROLE_USER'] };
    const component = new UserComponent(
      {} as any, { getUser: () => user } as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
    expect(component.currentUser).toBe(user);
  });
});
