/** Token class to get the values of user session storage for login purpose */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  constructor(private _router: Router) {}
  // Clear the session
  signOut(): void {
    window.sessionStorage.clear();
    //window.location.href = '/home';
    this._router.navigate(['home']).then(() => {
      window.location.reload();
    });
  }
  // Save Token values
  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
  // get current token value information
  public getToken(): string | null {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY)?.trim();
      return token && token !== 'null' && token !== 'undefined' ? token : null;
    } catch {
      return null;
    }
  }
  // save current user value into session storage
  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  // Get current user
  public getUser(): any | null {
    try {
      const storedUser = sessionStorage.getItem(USER_KEY);
      if (!storedUser) return null;
      const user = JSON.parse(storedUser);
      if (!user || typeof user !== 'object' || Array.isArray(user)) return null;

      // The API returns IDs as strings; older stored sessions may contain numbers.
      const validId = typeof user.id === 'string'
        ? /^[1-9][0-9]*$/.test(user.id)
        : Number.isSafeInteger(user.id) && user.id > 0;
      const validRoles = Array.isArray(user.roles) && user.roles.length > 0
        && user.roles.every((role: unknown) => role === 'ROLE_USER' || role === 'ROLE_ADMIN');
      return validId && validRoles ? user : null;
    } catch {
      return null;
    }
  }
}
