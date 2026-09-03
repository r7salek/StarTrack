import { ChangePasswordComponent } from './EditedUserProfile/changePassword/changePassword.component';
/** Component responsible for user profile data
 * User can modify data
 * User can create delete request
 */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserData } from 'src/app/models/user';
import { NotificationService } from 'src/app/services/notification.service';

import { EditedUserProfileComponent } from './EditedUserProfile/EditedUserProfile.component';
import { UserService } from '../services/user.service';
import { TokenStorageService } from '../core/login/_services/token-storage.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  userData: UserData[] = []; // Array with user data interface
  idValue: number | undefined;
  currentUser: any; // variable for current user
  constructor(
    public service: UserService, // Service responsible for getting user data through API
    private tokenStorageService: TokenStorageService, // Service responsible to get data from token
    public notificationService: NotificationService, // notification service
    private dialog: MatDialog
  ) {
    this.currentUser = this.tokenStorageService.getUser();
  }
  ngOnInit() {
    this.getUsers();
  }
  // Get current user information
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
  //Update user information
  UpdateUserProfile(row: any) {
    this.service.populateForm(row);
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '30%';
    this.dialog.open(EditedUserProfileComponent, dialogConfig);
  }
  ChangePassword(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '30%';
    this.dialog.open(ChangePasswordComponent, dialogConfig);
  }
}
