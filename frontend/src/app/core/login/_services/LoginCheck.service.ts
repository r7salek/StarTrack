import { Injectable, OnInit } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';


@Injectable({
  providedIn: 'root'
})
export class LoginCheck implements CanActivate, OnInit  { currentUser: any;

  constructor(private router: Router, private token: TokenStorageService) {
    if (!!token) {
      this.currentUser = this.token.getUser().roles;
    }
  }
  ngOnInit(): void {}

  canActivate() {
    if (this.currentUser) return true;
    this.router.navigate(['/home']);
    window.location.reload();
    return false;
  }

}
