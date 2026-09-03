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
    this.getUsers(); // get user
    this.roleService.getRoles().subscribe(
      // Get role data from API
      (res1) => {
        if (!!res1) {
          this.roleList = res1;
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
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
        alert(error.message);
      }
    );
  }
  // Method responsible for get the data for selected user and get this data into form
  public onUpdateUserRole(email: string, role: string[]): void {
    if(this.service.form.valid){
    this.service.updateUserRole(email, role).subscribe(
      (response: UserData) => {
        this.getUsers();
        this.service.form.reset();
        this.service.initializeFormGroup();
        this.notificationService.success(
          ':: User role is successfully updated'
        );
        this.dialogRef.close();
       // window.location.href = '/user-management';
        this._router.navigate(['user-management']).then(() => {
          window.location.reload();
        });
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }
}
  onClose() {
    // Close the dialog box
    this.dialogRef.close();
  }

}
