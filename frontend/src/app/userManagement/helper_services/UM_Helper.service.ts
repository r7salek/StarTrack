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
      'Deactivate this account? Access will be removed while historical attribution is retained.',
      () => {
        this.userService.deleteUser(email).subscribe(
          //Deleting the record
          () => {
            this.notificationService.success('Account deactivated; history retained.');
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
}
