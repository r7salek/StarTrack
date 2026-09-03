import { Injectable } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { UserData } from '../../models/user';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UM_HelperService {

  constructor(
    private userService: UserService,
    public notificationService: NotificationService
  ) {}
  //Delete the record from user management system
  public delete(email: string) {
    this.notificationService.confirmation(
      //Confirmation box before delete the record
      'Data will be deleted permanently ',
      () => {
        this.notificationService.success('Request Granted successfully'); //Success notification
        this.userService.deleteUser(email).subscribe(
          //Deleting the record
          (response: UserData) => {
            window.location.reload();
          },
          (error: HttpErrorResponse) => {
            this.notificationService.error('Error occured');
          }
        );
      },
      'Are you sure?',
      () => {
        this.notificationService.error('cancellation is confirmed');
      }
    );
  }
  // Updating the user role
  public onUpdateUser(email: string): void {
    this.userService.activateUser(email).subscribe(
      (response: UserData) => {
        // Success notification
        this.notificationService.success('Access Granted successfully');
        window.location.reload();
      },
      (error: HttpErrorResponse) => {
        this.notificationService.error('Error occured');
      }
    );
  }
   // Updating the User Password
  //Delete the record from user management system
  public onResetPassword(email: string) {
    this.notificationService.confirmation(
      //Confirmation box before delete the record
      'User password will be reset ',
      () => {
        this.notificationService.success('Request Granted successfully'); //Success notification
        this.userService.resetPassword(email).subscribe(
          //Deleting the record
          (response: UserData) => {
            window.location.reload();
          },
          (error: HttpErrorResponse) => {
            this.notificationService.error('Error occured');
          }
        );
      },
      'Are you sure?',
      () => {
        this.notificationService.error('cancellation is confirmed');
      }
    );
  }

}
