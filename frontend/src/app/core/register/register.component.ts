/**User Registraton component Logic */
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../login/_services/auth.service';
import { NotificationService } from '../../services/notification.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  form: any = {}; // form for user registration
  isSuccessful = false; // on button submit check the value is submitted suceessfully
  isSignUpFailed = false; // Check error
  errorMessage = ''; // Display error message
  hide = true;
  hide1 = true;
  constructor(
    private authService: AuthService, // Authservice is used to identify user from system if user doesnot exists then create user
    public notificationService: NotificationService, // notification service for messages
    public dialogRef: MatDialogRef<RegisterComponent> // Ref box to open dialog box for the form filling
    ,
    private _router: Router
  ) {}
  //only number can be enter for mobile number and mobile number format verification
  keyPress(event: any) {
    const pattern = /[0-9\+\-\ ]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  ngOnInit(): void {}
  onClose() {
    this.dialogRef.close();
    window.location.reload();
  }
  // Method is used to submit form values and create new user
  onSubmit(): void {
     this.authService.register(this.form).subscribe(
      (data) => {
        this.isSuccessful = true;
        if (!!this.isSuccessful) {
          this.notificationService.success('User is registered successfully');
         // window.location.href = '/home';
          this._router.navigate(['home']).then(() => {
            window.location.reload();
          });
        }
        this.isSignUpFailed = false;
      },
      (err) => {
        this.errorMessage = err.error.message;
        this.notificationService.error(this.errorMessage);
        this.isSignUpFailed = true;
      }
    );
  }
}
