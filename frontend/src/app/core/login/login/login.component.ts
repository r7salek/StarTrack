/**Login Component Logic for getting the data from tokenStorage and after verification
 *  Login into the system */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Optional } from '@angular/core';
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
  isSubmitting = false;
  currentUser: any[] = [];

  constructor(
    private authService: AuthService, // Auth service for authentication user
    private tokenStorage: TokenStorageService, // Store user information locally
    private route: ActivatedRoute, // router the URL information
    private _router: Router,
    private userLoginService: UserLoginService, // User login service
    public notificationService: NotificationService, // Notification service for messages
    @Optional() public dialogRef: MatDialogRef<LoginComponent> | null, // Also used as a routed page.
  ) {}

  ngOnInit(): void {
    const token: any = this.route.snapshot.queryParamMap.get('token'); // Current URl values
    const error: any = this.route.snapshot.queryParamMap.get('error'); // Error values

    // from local storage check user is login otherwise user will be authenticate from system and user will be login
    const storedUser = this.tokenStorage.getUser();
    this.isLoggedIn = !!this.tokenStorage.getToken() && !!storedUser;
    this.currentUser = [];
    if (this.isLoggedIn) {
      this.currentUser = storedUser;
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
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.isLoginFailed = false;
    this.authService.login(this.form).subscribe(
      (data) => {
        this.isSubmitting = false;
        this.tokenStorage.saveToken(data.accessToken);
        this.login(data.user);
        if (this.isLoggedIn) {
          this.isLoginFailed = false;
          this.notificationService.success('Signed in successfully.');
        }
      },
      (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to sign in. Check your email and password. New accounts must be activated by an administrator.';
        this.notificationService.error(this.errorMessage);
        this.isLoginFailed = true;
        this.isLoggedIn = false;
      }
    );
  }
  onClose() {
    if (this.dialogRef) this.dialogRef.close();
    else this._router.navigate(['home']);
  }
  // login method for getting vlaues of user after login redirect to landing page
  login(user: any): void {
    this.tokenStorage.saveUser(user);
    const storedUser = this.tokenStorage.getUser();
    if (!this.tokenStorage.getToken() || !storedUser) {
      this.isLoggedIn = false;
      this.isLoginFailed = true;
      this.currentUser = [];
      this.errorMessage = 'Unable to read a valid login session. Please sign in again.';
      this.notificationService.error(this.errorMessage);
      return;
    }
    this.isLoginFailed = false;
    this.isLoggedIn = true;
    this.currentUser = storedUser.roles;

    this._router.navigate(['projects']).then(() => {
      window.location.reload();
    });
  }
}
