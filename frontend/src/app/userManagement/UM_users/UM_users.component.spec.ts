import { UM_usersComponent } from './UM_users.component';

describe('UM_usersComponent', () => {
  it('creates without the removed password-reset column', () => {
    const component = new UM_usersComponent(
      {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
    expect(component.displayedColumns2).not.toContain('resetPassword');
  });
});
