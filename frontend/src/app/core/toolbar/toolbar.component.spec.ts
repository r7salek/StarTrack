import { ToolbarComponent } from './toolbar.component';
import { TokenStorageService } from '../login/_services/token-storage.service';

describe('ToolbarComponent', () => {
  let storage: TokenStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    storage = new TokenStorageService({} as any);
  });

  afterEach(() => sessionStorage.clear());

  it('creates in a logged-out state without reading invalid user fields', () => {
    const component = new ToolbarComponent(
      { getToken: () => null, getUser: () => null } as any,
      {} as any, {} as any
    );
    expect(component).toBeTruthy();
    expect(component.isLoggedIn).toBeFalse();
  });

  for (const storedUser of [null, '{invalid-json', '{}']) {
    it(`stays logged out safely with a token and invalid user ${storedUser}`, () => {
      storage.saveToken('synthetic-token');
      if (storedUser !== null) sessionStorage.setItem('auth-user', storedUser);
      const component = new ToolbarComponent(storage, {} as any, {} as any);
      expect(component.isLoggedIn).toBeFalse();
      expect(component.isUser).toBeFalse();
      expect(component.isAdmin).toBeFalse();
      expect(component.getCurrentEmail()).toBe('');
    });
  }

  it('does not show authenticated roles without a token', () => {
    storage.saveUser({ id: '7', roles: ['ROLE_USER', 'ROLE_ADMIN'] });
    const component = new ToolbarComponent(storage, {} as any, {} as any);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.isUser).toBeFalse();
    expect(component.isAdmin).toBeFalse();
  });

  it('preserves names, email and role menus for a valid stored session', () => {
    storage.saveToken('synthetic-token');
    storage.saveUser({
      id: '7', firstName: 'Test', lastName: 'User', email: 'user@startrack.test',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
    });
    const component = new ToolbarComponent(storage, {} as any, {} as any);
    expect(component.isLoggedIn).toBeTrue();
    expect(component.isUser).toBeTrue();
    expect(component.isAdmin).toBeTrue();
    expect(component.firstName).toBe('Test');
    expect(component.lastName).toBe('User');
    expect(component.getCurrentEmail()).toBe('user@startrack.test');
  });
});
