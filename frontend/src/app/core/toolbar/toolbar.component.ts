/**Component use to define logic for TOP navigation bar
 *
 */
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoginComponent } from '../login/login/login.component';
import { TokenStorageService } from '../login/_services/token-storage.service';
import { RegisterComponent } from '../register/register.component';


@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  cohort!:string;
  isLoggedIn = false; // flag for checking user login
  userName!: string; // GEt username
  firstName!: string; // get first name of user
  lastName!: string; // get last name of the user
  role!: string; // Get the user role
  currentUser: any; // value store for current user
  isAdmin = false; // check if the user is admin
  isUser = false; // check if the user is normal user
  public totalItem: number = 0; // count items in the cart
  constructor(
    private tokenStorageService: TokenStorageService, // Service is used for getting information related to user
    private dialog: MatDialog, // open fialog box
    private _router: Router
  ) {
    // Get login information of user if he is login and store values for further processing
    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      this.currentUser = this.tokenStorageService.getUser();
      this.isLoggedIn = true;
      const user = this.tokenStorageService.getUser();
      this.userName = user.userName;
    }
    if (!!this.tokenStorageService) {
      this.currentUser = this.tokenStorageService.getUser();
      if (!!this.currentUser) {
        this.firstName = this.currentUser.firstName;
        this.lastName = this.currentUser.lastName;
        var role = this.currentUser.roles;
        if (!!role) {
          this.isUser = false;
          this.isAdmin = false;
          if (role.includes('ROLE_ADMIN')) {
            this.isAdmin = true;
          }
          if (role.includes('ROLE_USER')) {
            this.isUser = true;
          }
        }
      }
    }
  }
  // Dialog box logic for registration
  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '30%';
    dialogConfig.disableClose = true;
    this.dialog.open(RegisterComponent, dialogConfig);
  }
  // Dialog box logic for login user
  openLoginDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25%';
    dialogConfig.disableClose = true;
    this.dialog.open(LoginComponent, dialogConfig);
  }
  ngOnInit() {
  }
  // Logout information
   logout(): void {
    this.tokenStorageService.signOut();
    window.location.reload();
    //window.location.href = '/home';
    this._router.navigate(['home']).then(() => {
      window.location.reload();
    });
  }
  // Get current user email
  public getCurrentEmail() {
    if (!!this.currentUser.email) {
      return this.currentUser.email;
    }
    else{
      return'';
    }
  }
}
