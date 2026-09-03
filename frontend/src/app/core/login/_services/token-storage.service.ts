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
  public getToken(): string {
    return sessionStorage.getItem(TOKEN_KEY)!;
  }
  // save current user value into session storage
  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  // Get current user
  public getUser(): any {
    return JSON.parse(sessionStorage.getItem(USER_KEY)!);
  }
}
