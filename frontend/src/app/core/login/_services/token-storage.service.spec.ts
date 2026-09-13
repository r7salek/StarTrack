import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService session expiry navigation', () => {
  afterEach(() => sessionStorage.clear());

  for (const navigated of [false, true]) {
    it(`clears expired credentials but reloads only after approved navigation (${navigated})`, async () => {
      const service = new TokenStorageService({ navigate: () => Promise.resolve(navigated) } as any);
      const reload = spyOn<any>(service, 'reloadPage');
      service.saveToken('synthetic-expired-token');
      service.signOut();
      await Promise.resolve();
      expect(service.getToken()).toBeNull();
      expect(reload.calls.count()).toBe(navigated ? 1 : 0);
    });
  }
});
