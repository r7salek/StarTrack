import { UpdateUserComponent } from './UpdateUser.component';

describe('UpdateUserComponent', () => {
  it('creates with isolated collaborators', () => {
    const component = new UpdateUserComponent(
      {} as any, {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
});
