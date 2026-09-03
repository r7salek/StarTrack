/**Service for protecting the routes in case user is not login */
import { Injectable, OnInit } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, OnInit {
  currentUser: any;

  constructor(private router: Router, private token: TokenStorageService) {
    if (!!token) {
      this.currentUser = this.token.getUser().roles;
    }
  }
  ngOnInit(): void {}
  // verify user is normal user then the path can be access
  canActivate() {
    if (this.currentUser.includes('ROLE_USER')) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
