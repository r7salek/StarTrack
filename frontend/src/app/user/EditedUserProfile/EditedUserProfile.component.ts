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
    if (!!this.currentUser.id) {
      this.service.getCurrentUser(this.currentUser.id).subscribe(
        (res1) => {
          if (!!res1) {
            this.service.populateForm(res1);
            this.idValue = this.currentUser.id;
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    }
  }
  //Update the user data which is modify into the form
  public updateUserProfile(userData: UserData): void {
    if(this.service.form.valid){
      this.service.updateUserProfile(this.idValue, userData).subscribe(
        (response: UserData) => {
          this.getUsers();
          this.service.form.reset();
          this.service.initializeFormGroup();
          this.notificationService.success(
            ':: User Profile is successfully updated'
          );
          this.dialogRef.close();
          window.location.reload();
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    }
    else{
      this.notificationService.error(
        ':: User role is unsuccessfully updated. Pelase fill out all necessary fields'
      );
    }
    if (this.service.form.invalid) {
      return;
    }
  }
  // Close the dialog box
  onClose() {
    this.dialogRef.close();
    window.location.reload();
  }
}
