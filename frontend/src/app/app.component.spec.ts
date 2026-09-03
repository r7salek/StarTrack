import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('initialises as logged out when there is no stored token', () => {
    const component = new AppComponent({
      getToken: () => null,
      getUser: () => null,
    } as any);
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.isLoggedIn).toBeFalse();
  });
});
