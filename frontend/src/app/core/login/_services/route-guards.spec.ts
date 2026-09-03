import { AdminAuthGuard } from './admin-auth-guard.service';
import { AuthGuard } from './AuthGuardService.service';
import { LoginCheck } from './LoginCheck.service';
import { TokenStorageService } from './token-storage.service';

describe('route guards', () => {
  let router: jasmine.SpyObj<any>;
  let storage: TokenStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    router = jasmine.createSpyObj('Router', ['navigate']);
    storage = new TokenStorageService(router);
  });

  afterEach(() => sessionStorage.clear());

  function signIn(roles: string[]): void {
    storage.saveToken('synthetic-token');
    storage.saveUser({ id: 1, roles });
  }

  it('denies an anonymous visitor from authenticated routes', () => {
    expect(new LoginCheck(router, storage).canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('allows ordinary and administrator users through authenticated routes', () => {
    const guard = new LoginCheck(router, storage);
    signIn(['ROLE_USER']);
    expect(guard.canActivate()).toBeTrue();

    signIn(['ROLE_ADMIN']);
    expect(guard.canActivate()).toBeTrue();
  });

  it('allows an ordinary user through user routes', () => {
    signIn(['ROLE_USER']);
    expect(new AuthGuard(router, storage).canActivate()).toBeTrue();
  });

  it('denies an ordinary user from administrator routes', () => {
    signIn(['ROLE_USER']);
    expect(new AdminAuthGuard(router, storage).canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('allows an administrator through administrator routes', () => {
    signIn(['ROLE_ADMIN']);
    expect(new AdminAuthGuard(router, storage).canActivate()).toBeTrue();
  });

  it('evaluates storage on every navigation attempt', () => {
    const guard = new AdminAuthGuard(router, storage);
    expect(guard.canActivate()).toBeFalse();

    signIn(['ROLE_ADMIN']);
    expect(guard.canActivate()).toBeTrue();
  });

  it('denies malformed stored user data without throwing', () => {
    storage.saveToken('synthetic-token');
    sessionStorage.setItem('auth-user', '{invalid-json');

    expect(() => new LoginCheck(router, storage).canActivate()).not.toThrow();
    expect(new LoginCheck(router, storage).canActivate()).toBeFalse();
    expect(new AuthGuard(router, storage).canActivate()).toBeFalse();
    expect(new AdminAuthGuard(router, storage).canActivate()).toBeFalse();
  });
});
