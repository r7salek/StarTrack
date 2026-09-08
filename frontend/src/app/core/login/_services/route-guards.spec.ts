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

  function expectAllGuardsToDeny(): void {
    expect(new LoginCheck(router, storage).canActivate()).toBeFalse();
    expect(new AuthGuard(router, storage).canActivate()).toBeFalse();
    expect(new AdminAuthGuard(router, storage).canActivate()).toBeFalse();
  }

  it('denies structurally invalid sessions even when JSON is valid', () => {
    storage.saveToken('synthetic-token');
    for (const user of [null, [], 'user', {}, { roles: ['ROLE_ADMIN'] },
      { id: 0, roles: ['ROLE_USER'] }, { id: {}, roles: ['ROLE_ADMIN'] },
      { id: 'invalid', roles: ['ROLE_USER'] }, { id: 1, roles: [123] },
      { id: 1, roles: ['UNKNOWN'] }, { id: 1, roles: ['ROLE_ADMIN', null] }]) {
      storage.saveUser(user);
      expectAllGuardsToDeny();
    }
  });

  it('denies missing, blank and accidentally stringified null tokens', () => {
    signIn(['ROLE_ADMIN', 'ROLE_USER']);
    sessionStorage.removeItem('auth-token');
    expectAllGuardsToDeny();
    for (const token of ['', '   ', 'null', 'undefined']) {
      storage.saveToken(token);
      expectAllGuardsToDeny();
    }
  });

  it('denies safely when browser storage access throws', () => {
    signIn(['ROLE_ADMIN', 'ROLE_USER']);
    spyOn(Storage.prototype, 'getItem').and.throwError('Storage unavailable');
    expectAllGuardsToDeny();
  });

  it('accepts the string user ID returned by the API', () => {
    storage.saveToken('synthetic-token');
    storage.saveUser({ id: '7', roles: ['ROLE_ADMIN', 'ROLE_USER'] });
    expect(new LoginCheck(router, storage).canActivate()).toBeTrue();
    expect(new AuthGuard(router, storage).canActivate()).toBeTrue();
    expect(new AdminAuthGuard(router, storage).canActivate()).toBeTrue();
  });

  it('denies every previously allowed guard immediately after sign-out', () => {
    const guards = [new LoginCheck(router, storage), new AuthGuard(router, storage),
      new AdminAuthGuard(router, storage)];
    signIn(['ROLE_ADMIN', 'ROLE_USER']);
    guards.forEach(guard => expect(guard.canActivate()).toBeTrue());
    sessionStorage.clear();
    guards.forEach(guard => expect(guard.canActivate()).toBeFalse());
  });
});
