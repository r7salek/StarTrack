import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AppConstants } from '../common/app.constants';
import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { TokenStorageService } from '../_services/token-storage.service';
import { DraftSafetyService, UnsavedProjectGuard } from '../../../services/draft-safety.service';

describe('AuthInterceptor', () => {
  function reject(url: string, status: number) {
    const token = { getToken: () => null, signOut: jasmine.createSpy('signOut') };
    const interceptor = new AuthInterceptor(token as any, {} as any);
    const error = new HttpErrorResponse({ status });
    const next = { handle: () => throwError(() => error) };
    const observed = jasmine.createSpy('error');
    interceptor.intercept(new HttpRequest('POST', url, {}), next).subscribe({ error: observed });
    expect(observed).toHaveBeenCalledWith(error);
    return token;
  }

  it('does not reload or sign out on a rejected sign-in', () => {
    expect(reject(AppConstants.AUTH_API + 'signin', 401).signOut).not.toHaveBeenCalled();
  });
  it('leaves registration failures with the form', () => {
    expect(reject(AppConstants.AUTH_API + 'signup', 401).signOut).not.toHaveBeenCalled();
  });
  it('still clears an expired session on a protected API 401', () => {
    expect(reject('/api/projects', 401).signOut).toHaveBeenCalledTimes(1);
  });
  it('does not sign out for authorization or server errors', () => {
    for (const status of [403, 500]) expect(reject('/api/projects', status).signOut).not.toHaveBeenCalled();
  });
  for (const discard of [false, true]) {
    it(`respects the dirty-editor decision after a protected 401 (discard=${discard})`, fakeAsync(() => {
      const notices = jasmine.createSpyObj('NotificationService', ['confirmation', 'error']);
      const drafts = new DraftSafetyService(notices);
      const editor = { hasUnsavedChanges: true, isSaving: false };
      drafts.register(editor);
      const guard = new UnsavedProjectGuard(drafts);
      const token = new TokenStorageService({ navigate: () => guard.canDeactivate() } as any);
      const reload = spyOn<any>(token, 'reloadPage');
      token.saveToken('synthetic-expired-token');
      const interceptor = new AuthInterceptor(token, {} as any);
      interceptor.intercept(new HttpRequest('GET', '/api/projects'), {
        handle: () => throwError(() => new HttpErrorResponse({ status: 401 })),
      }).subscribe({ error: () => {} });
      expect(token.getToken()).toBeNull();
      expect(reload).not.toHaveBeenCalled();
      const confirmation = notices.confirmation.calls.mostRecent().args;
      confirmation[discard ? 1 : 3]();
      flushMicrotasks();
      expect(reload.calls.count()).toBe(discard ? 1 : 0);
      expect(editor.hasUnsavedChanges).toBeTrue();
      sessionStorage.clear();
    }));
  }
});
