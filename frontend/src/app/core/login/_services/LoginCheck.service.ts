import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';


@Injectable({
  providedIn: 'root'
})
export class LoginCheck implements CanActivate {
  constructor(private router: Router, private token: TokenStorageService) {}

  canActivate(): boolean {
    const user = this.token.getUser();
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (this.token.getToken() && roles.length > 0) return true;
    this.router.navigate(['/home']);
    return false;
  }
}
