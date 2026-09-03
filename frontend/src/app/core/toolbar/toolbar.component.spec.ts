import { ToolbarComponent } from './toolbar.component';

describe('ToolbarComponent', () => {
  it('creates in a logged-out state without reading invalid user fields', () => {
    const component = new ToolbarComponent(
      { getToken: () => null, getUser: () => null } as any,
      {} as any, {} as any
    );
    expect(component).toBeTruthy();
    expect(component.isLoggedIn).toBeFalse();
  });
});
