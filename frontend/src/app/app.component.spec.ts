import { AppComponent } from './app.component';
import { TokenStorageService } from './core/login/_services/token-storage.service';

describe('AppComponent', () => {
  let storage: TokenStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    storage = new TokenStorageService({} as any);
  });

  afterEach(() => sessionStorage.clear());

  it('initialises as logged out when there is no stored token', () => {
    const component = new AppComponent({
      getToken: () => null,
      getUser: () => null,
    } as any);
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(component.isLoggedIn).toBeFalse();
  });

  for (const storedUser of [null, '{invalid-json', '{}']) {
    it(`stays logged out safely with a token and invalid user ${storedUser}`, () => {
      storage.saveToken('synthetic-token');
      if (storedUser !== null) sessionStorage.setItem('auth-user', storedUser);
      const component = new AppComponent(storage);
      expect(() => component.ngOnInit()).not.toThrow();
      expect(component.isLoggedIn).toBeFalse();
    });
  }

  it('requires a token even when the stored user is valid', () => {
    storage.saveUser({ id: '7', roles: ['ROLE_USER'] });
    const component = new AppComponent(storage);
    component.ngOnInit();
    expect(component.isLoggedIn).toBeFalse();
  });

  it('accepts a token and a valid API-shaped stored user', () => {
    storage.saveToken('synthetic-token');
    storage.saveUser({ id: '7', roles: ['ROLE_USER', 'ROLE_ADMIN'] });
    const component = new AppComponent(storage);
    component.ngOnInit();
    expect(component.isLoggedIn).toBeTrue();
  });
});
