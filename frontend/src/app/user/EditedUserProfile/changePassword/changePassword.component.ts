import { NotificationService } from 'src/app/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { ConfirmPasswordValidator } from './confirm-password.validators';
import { UserService } from '../../../services/user.service';
import { TokenStorageService } from '../../../core/login/_services/token-storage.service';
import { UserPassword } from '../../../models/user';

@Component({
  selector: 'app-changePassword',
  templateUrl: './changePassword.component.html',
  styleUrls: ['./changePassword.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  isSaving = false;
  error = '';
  currentUser: any;
  idValue!: number;
  registerForm!: FormGroup;
  submitted: boolean = false;
  hide = true;
  hide1 = true;
  constructor(
    public service: UserService, // GEt user information to work with
    private tokenStorageService: TokenStorageService, // Service get the user token information
    public notificationService: NotificationService, // notification logic
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    private fb: FormBuilder
  ) {
    // Get current login user
    this.currentUser = this.tokenStorageService.getUser();
  }
  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: ConfirmPasswordValidator('password', 'confirmPassword'),
      }
    );
  }
  //Update the user data which is modify into the form
  public updateUserPassword(userPassword: UserPassword): void {
    if (this.isSaving) return;
    this.error = '';
    this.registerForm.markAllAsTouched();
    this.submitted = true;
    if (this.registerForm.valid) {
      this.isSaving = true;
      this.service
        .updateUserPassword(this.currentUser.id, userPassword)
        .subscribe(
          (response: UserPassword) => {
            this.isSaving = false;
            this.registerForm.reset();
            this.notificationService.success(
              'Your password has been changed.'
            );
            this.dialogRef.close();
          },
          (error: HttpErrorResponse) => {
            this.isSaving = false;
            this.error = 'Your password could not be changed. Please try again.';
          }
        );
    } else {
      this.notificationService.error(
        'Check that both password fields are complete and match.'
      );
    }
    if (this.registerForm.invalid) {
      return;
    }
  }
  // Close the dialog box
  onClose() {
    if (this.isSaving) return;
    this.dialogRef.close();
  }
}
