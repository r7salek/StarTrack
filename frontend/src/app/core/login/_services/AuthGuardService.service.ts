/**Service for protecting the routes in case user is not login */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private token: TokenStorageService) {}

  // verify user is normal user then the path can be access
  canActivate(): boolean {
    const user = this.token.getUser();
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (this.token.getToken() && roles.includes('ROLE_USER')) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
