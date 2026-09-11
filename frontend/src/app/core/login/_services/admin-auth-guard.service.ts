/**Service defining the Admin rights routes activation
 *
 */
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router, private token: TokenStorageService) {}

  //Defining the logic for Admin rights
  canActivate(): boolean {
    const user = this.token.getUser();
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (this.token.getToken() && roles.includes('ROLE_ADMIN')) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
