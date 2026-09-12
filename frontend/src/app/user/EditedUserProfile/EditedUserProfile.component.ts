/** Component is responsible to modifiy user details and save into the database */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserData } from 'src/app/models/user';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { TokenStorageService } from '../../core/login/_services/token-storage.service';

@Component({
  selector: 'app-EditedUserProfile',
  templateUrl: './EditedUserProfile.component.html',
  styleUrls: ['./EditedUserProfile.component.scss'],
})
export class EditedUserProfileComponent implements OnInit {
  isSaving = false;
  isLoading = false;
  error = '';
  currentUser: any;
  idValue!: number;
  userData: UserData[] = [];
  constructor(
    public service: UserService, // GEt user information to work with
    private tokenStorageService: TokenStorageService, // Service get the user token information
    public notificationService: NotificationService, // notification logic
    public dialogRef: MatDialogRef<EditedUserProfileComponent>
  ) {
    // Get current login user
    this.currentUser = this.tokenStorageService.getUser();
  }
  //only number will be add

  ngOnInit() {
    this.getUsers();
  }
  //GEt current user and populate data into form
  public getUsers() {
    if (!!this.currentUser?.id) {
      this.isLoading = true;
      this.service.getCurrentUser(this.currentUser.id).subscribe(
        (res1) => {
          this.isLoading = false;
          if (!!res1) {
            this.service.populateForm(res1);
            this.idValue = this.currentUser.id;
          }
        },
        (error: HttpErrorResponse) => {
          this.isLoading = false;
          this.error = 'Your profile could not be loaded. Close this dialog and try again.';
        }
      );
    }
  }
  //Update the user data which is modify into the form
  public updateUserProfile(userData: UserData): void {
    if (this.isSaving || this.isLoading || !this.idValue) return;
    this.error = '';
    this.service.form.markAllAsTouched();
    if(this.service.form.valid){
      this.isSaving = true;
      this.service.updateUserProfile(this.idValue, userData).subscribe(
        (response: UserData) => {
          this.isSaving = false;
          this.notificationService.success(
            'Your profile has been updated.'
          );
          this.dialogRef.close(true);
        },
        (error: HttpErrorResponse) => {
          this.isSaving = false;
          this.error = 'Your profile could not be saved. Please try again.';
        }
      );
    }
    else{
      this.notificationService.error(
        'Check the highlighted profile fields.'
      );
    }
    if (this.service.form.invalid) {
      return;
    }
  }
  // Close the dialog box
  onClose() {
    if (this.isSaving) return;
    this.dialogRef.close();
  }
}
