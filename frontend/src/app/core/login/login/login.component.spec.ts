import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('creates without making an authentication request', () => {
    const component = new LoginComponent(
      {} as any, {} as any,
      { snapshot: { queryParamMap: { get: () => null } } } as any,
      {} as any, {} as any, {} as any, {} as any
    );
    expect(component).toBeTruthy();
  });
});
