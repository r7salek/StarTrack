/**Service defining the Admin rights routes activation
 *
 */
import { Injectable, OnInit } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate, OnInit {
  currentUser: any;
  constructor(private router: Router, private token: TokenStorageService) {
    if (!!token) {
      this.currentUser = this.token.getUser().roles;
    }
  }
  ngOnInit(): void {}
  //Defining the logic for Admin rights
  canActivate() {
    if (this.currentUser.includes('ROLE_ADMIN')) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
