import { LoginComponent } from './login.component';
import { TokenStorageService } from '../_services/token-storage.service';
import { of, Subject, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let storage: TokenStorageService;
  let router: jasmine.SpyObj<any>;
  let authService: jasmine.SpyObj<any>;
  let userLoginService: jasmine.SpyObj<any>;
  let notifications: jasmine.SpyObj<any>;
  let queryParamMap: jasmine.SpyObj<any>;
  let component: LoginComponent;

  beforeEach(() => {
    sessionStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);
    // Assert the requested navigation without performing the subsequent page reload.
    router.navigate.and.returnValue({ then: jasmine.createSpy('navigationThen') });
    storage = new TokenStorageService(router);
    authService = jasmine.createSpyObj('AuthService', ['login']);
    userLoginService = jasmine.createSpyObj('UserLoginService', ['getCurrentUser']);
    notifications = jasmine.createSpyObj('NotificationService', ['error', 'success']);
    queryParamMap = jasmine.createSpyObj('QueryParamMap', ['get']);
    queryParamMap.get.and.returnValue(null);
    component = new LoginComponent(
      authService, storage, { snapshot: { queryParamMap } } as any,
      router, userLoginService, notifications, {} as any
    );
  });

  afterEach(() => sessionStorage.clear());

  it('creates without making an authentication request', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(component.isLoggedIn).toBeFalse();
    expect(authService.login).not.toHaveBeenCalled();
    expect(userLoginService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('prevents duplicate sign-in requests while pending', () => {
    authService.login.and.returnValue(new Subject());
    component.onSubmit();
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it('explains activation and permits retry after failed sign-in', () => {
    authService.login.and.returnValue(throwError(() => ({ status: 401 })));
    component.onSubmit();
    expect(component.isSubmitting).toBeFalse();
    expect(component.isLoginFailed).toBeTrue();
    expect(component.errorMessage).toContain('activated by an administrator');
  });

  for (const storedUser of [null, '{invalid-json', '{}']) {
    it(`keeps the login form available with a token and invalid user ${storedUser}`, () => {
      storage.saveToken('synthetic-token');
      if (storedUser !== null) sessionStorage.setItem('auth-user', storedUser);
      expect(() => component.ngOnInit()).not.toThrow();
      expect(component.isLoggedIn).toBeFalse();
      expect(userLoginService.getCurrentUser).not.toHaveBeenCalled();
    });
  }

  it('requires a token even when the stored user is valid', () => {
    storage.saveUser({ id: '7', roles: ['ROLE_USER'] });
    component.ngOnInit();
    expect(component.isLoggedIn).toBeFalse();
  });

  it('recognizes an existing valid stored session', () => {
    storage.saveToken('synthetic-token');
    storage.saveUser({ id: '7', roles: ['ROLE_USER'] });
    component.ngOnInit();
    expect(component.isLoggedIn).toBeTrue();
  });

  it('rejects invalid login responses without dereferencing or navigating', () => {
    storage.saveToken('synthetic-token');
    for (const user of [null, undefined, {}, { id: '7', roles: ['UNKNOWN'] }]) {
      expect(() => component.login(user)).not.toThrow();
      expect(component.isLoggedIn).toBeFalse();
      expect(component.isLoginFailed).toBeTrue();
    }
    expect(router.navigate).not.toHaveBeenCalled();
    expect(notifications.success).not.toHaveBeenCalled();
  });

  it('does not complete login without a token', () => {
    component.login({ id: '7', roles: ['ROLE_USER'] });
    expect(component.isLoggedIn).toBeFalse();
    expect(component.isLoginFailed).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('does not report a malformed sign-in response as successful', () => {
    authService.login.and.returnValue(of({ accessToken: 'synthetic-token', user: {} }));
    component.onSubmit();
    expect(component.isLoggedIn).toBeFalse();
    expect(component.isLoginFailed).toBeTrue();
    expect(notifications.error).toHaveBeenCalled();
    expect(notifications.success).not.toHaveBeenCalled();
  });

  for (const [role, destination] of [['ROLE_USER', 'projects'], ['ROLE_ADMIN', 'projects']]) {
    it(`opens the shared overview after successful ${role} login`, () => {
      authService.login.and.returnValue(of({
        accessToken: 'synthetic-token', user: { id: '7', roles: [role] },
      }));
      component.onSubmit();
      expect(component.isLoggedIn).toBeTrue();
      expect(component.isLoginFailed).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith([destination]);
      expect(notifications.success).toHaveBeenCalled();
    });
  }

  it('keeps the existing query-token flow usable while user lookup is pending', () => {
    queryParamMap.get.and.callFake((key: string) => key === 'token' ? 'synthetic-token' : null);
    userLoginService.getCurrentUser.and.returnValue(of({ id: '7', roles: ['ROLE_USER'] }));
    component.ngOnInit();
    expect(userLoginService.getCurrentUser).toHaveBeenCalled();
    expect(storage.getToken()).toBe('synthetic-token');
    expect(component.isLoggedIn).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['projects']);
  });
});
