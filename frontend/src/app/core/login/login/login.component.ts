/**Login Component Logic for getting the data from tokenStorage and after verification
 *  Login into the system */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from '../_services/auth.service';
import { TokenStorageService } from '../_services/token-storage.service';
import { UserLoginService } from '../_services/UserLoginService.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  // Defining the fields and variables which will use to get data on Front end HTML code
  form: any = {};
  isLoggedIn = false;
  isLoginFailed = false;
  isData = false;
  hide = true;
  errorMessage = '';
  currentUser: any[] = [];

  constructor(
    private authService: AuthService, // Auth service for authentication user
    private tokenStorage: TokenStorageService, // Store user information locally
    private route: ActivatedRoute, // router the URL information
    private _router: Router,
    private userLoginService: UserLoginService, // User login service
    public notificationService: NotificationService, // Notification service for messages
    public dialogRef: MatDialogRef<LoginComponent>, // Ref box for dialog box user login
  ) {}

  ngOnInit(): void {
    const token: any = this.route.snapshot.queryParamMap.get('token'); // Current URl values
    const error: any = this.route.snapshot.queryParamMap.get('error'); // Error values

    // from local storage check user is login otherwise user will be authenticate from system and user will be login
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.currentUser = this.tokenStorage.getUser();
    } else if (token) {
      this.tokenStorage.saveToken(token);
      this.userLoginService.getCurrentUser().subscribe(
        (data) => {
          this.login(data);
        },
        (err) => {
          this.errorMessage = err.error.message;
          this.notificationService.error(this.errorMessage);
          this.isLoginFailed = true;
        }
      );
    } else if (error) {
      this.notificationService.error(error);
      this.isLoginFailed = true;
    }
  }
  // Login submit logic which verify user from the Server
  onSubmit(): void {
    this.authService.login(this.form).subscribe(
      (data) => {
        this.tokenStorage.saveToken(data.accessToken);
        this.login(data.user);
        this.isLoginFailed = false;
        this.notificationService.success('User is Login successfully');
      },
      (err) => {
        this.notificationService.error(err.error.message);
        this.isLoginFailed = true;
        this.isLoggedIn = false;
      }
    );
  }
  onClose() {
    this.dialogRef.close();
    window.location.reload();
  }
  // login method for getting vlaues of user after login redirect to landing page
  login(user: any): void {
    this.tokenStorage.saveUser(user);
    this.isLoginFailed = false;
    this.isLoggedIn = true;
    this.currentUser = this.tokenStorage?.getUser().roles;

    if (this.currentUser.includes('ROLE_USER')) {
      this._router.navigate(['createProject']).then(() => {
        window.location.reload();
      });
    }
    else if (this.currentUser.includes('ROLE_ADMIN')) {
     // window.location.href = '/#/user-management';
      this._router.navigate(['user-management']).then(() => {
        window.location.reload();
      });
    }
  }
}
