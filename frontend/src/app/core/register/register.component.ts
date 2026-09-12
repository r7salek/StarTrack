/**User Registraton component Logic */
import { Component, OnInit, Optional } from '@angular/core';
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
  isSubmitting = false;
  constructor(
    private authService: AuthService, // Authservice is used to identify user from system if user doesnot exists then create user
    public notificationService: NotificationService, // notification service for messages
    @Optional() public dialogRef: MatDialogRef<RegisterComponent> | null // Also available as a routed page.
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
    if (this.dialogRef) this.dialogRef.close();
    else this._router.navigate(['home']);
  }
  // Method is used to submit form values and create new user
  onSubmit(): void {
    if (this.isSubmitting) return;
    if (this.form.password !== this.form.matchingPassword) {
      this.errorMessage = 'The passwords must match.';
      this.isSignUpFailed = true;
      return;
    }
    this.isSubmitting = true;
    this.isSignUpFailed = false;
     this.authService.register(this.form).subscribe(
      (data) => {
        this.isSubmitting = false;
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'We could not register this account. Check your details and try again, or contact your StarTrack administrator.';
        this.notificationService.error(this.errorMessage);
        this.isSignUpFailed = true;
      }
    );
  }
}
