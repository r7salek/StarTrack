import { Component, OnInit } from '@angular/core';
import { UserData } from '../../models/user';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Role } from '../../models/role';
import { RoleService } from '../../services/Role.service';

@Component({
  selector: 'app-UpdateUser',
  templateUrl: './UpdateUser.component.html',
  styleUrls: ['./UpdateUser.component.scss']
})
export class UpdateUserComponent implements OnInit {
  isSaving = false;
  isLoading = true;
  error = '';

  selected: any;
  roleList!: any[];
  userData: UserData[] = [];
  constructor(
    public service: UserService, // Service responsible for whole user data from database
    public roleService: RoleService, // service responsible for role data from database
    public notificationService: NotificationService, // service responsible for notification logic
    private _router: Router, // router
    public dialogRef: MatDialogRef<UpdateUserComponent> // for dialog box
  ) {}
  ngOnInit() {
    this.roleService.getRoles().subscribe(
      // Get role data from API
      (res1) => {
        this.isLoading = false;
        if (!!res1) {
          this.roleList = res1;
        }
      },
      (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.error = 'Roles could not be loaded. Close this dialog and try again.';
      }
    );
  }
  public getUsers() {
    // Fetch data from API for user
    this.service.getUserData().subscribe(
      (res1) => {
        if (!!res1) {
          res1.filter((res) => res.enabled === true);
        }
      },
      (error: HttpErrorResponse) => {
        this.error = 'Accounts could not be loaded.';
      }
    );
  }
  // Method responsible for get the data for selected user and get this data into form
  public onUpdateUserRole(email: string, role: string[]): void {
    if (this.isSaving || this.isLoading) return;
    this.service.form.markAllAsTouched();
    if(this.service.form.valid){
    this.error = '';
    this.isSaving = true;
    this.service.updateUserRole(email, role).subscribe(
      (response: UserData) => {
        this.isSaving = false;
        this.notificationService.success(
          'Account roles updated.'
        );
        this.dialogRef.close(true);
      },
      (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.error = 'Roles could not be saved. Please try again.';
      }
    );
  }
}
  onClose() {
    if (this.isSaving) return;
    // Close the dialog box
    this.dialogRef.close();
  }

}
