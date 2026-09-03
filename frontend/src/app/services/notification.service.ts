import { Component, Inject, Injectable } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private readonly snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  config: MatSnackBarConfig = {
    duration: 5000, // set the delay for notification
    horizontalPosition: 'right', // define the location
    verticalPosition: 'top', // define the position of notification

  };
  // on success then config for notification
  success(msg: string) {
    this.config['panelClass'] = ['success', 'notification'];
    this.snackBar.open(msg, '', this.config);
  }
  // on error then config for notification
  error(msg: string) {
    this.config['panelClass'] = ['error', 'notification'];
    this.snackBar.open('', msg, this.config);
  }

  /**
   * Shows a confirmation modal, presenting the user with
   * an OK and Cancel button.
   * @param message Body of the modal
   * @param okCallback Optional function to call when the user clicks Ok
   * @param title Optional modal title
   * @param cancelCallback Option function to call when the user clicks Cancel
   * @example
   * //displays a success or error message depending on what button is clicked.
   */
  // confirmation box
  confirmation(
    message: string,
    okCallback: () => void,
    title = 'Are you sure?',
    cancelCallback: () => any = () => {}
  ) {
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '450px',
      data: { message: message, title: title },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && okCallback) {
        okCallback();
      }
      if (!result && cancelCallback) {
        cancelCallback();
      }
    });
  }
  /**
  * Shows a modal, presenting the user with an OK button.
  * @param message Body of the modal
  * @param okCallback Optional function to call when the user clicks Ok
  * @param title Optional modal title
  * @example
  * //displays a success when the Ok button is clicked.
  *  this.notificationService.alert("an alert", "notice", () => {
      this.notificationService.success("alert oked");
    });
  */
  alert(message: string, title = 'Notice', okCallback: () => void = () => {}) {
    const dialogRef = this.dialog.open(AlertDialog, {
      width: '400px',
      data: { message: message, title: title },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && okCallback) {
        okCallback();
      }
    });
  }

  /**
   * Displays a toast with provided message
   * @param message Message to display
   * @param action Action text, e.g. Close, Done, etc
   * @param className Optional extra css class to apply
   * @param duration Optional number of SECONDS to display the notification for
   */
  openSnackBar(
    message: string,
    action: string,
    className = '',
    duration = 3000
  ) {
    this.snackBar.open(message, action, {
      duration: duration,
      panelClass: [className],
    });
  }
}
// interface fpr doalog values for notification
export interface DialogData {
  message: string;
  title: string;
}
// html logic
@Component({
  template: `
    <div class="header" style="text-align: center">
      <h1 mat-dialog-title>{{ data.title }}</h1>
    </div>
    <div mat-dialog-content style="text-align: center">
      <p class="dialog-message">{{ data.message }}</p>
    </div>
    <div mat-dialog-actions style="text-align: center">
      <button
        type="button"
        style="margin-right:10px; background-color: #008CBA;  border: none; color: white; padding: 10px 10px; text-align: center;
          text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;"
        (click)="onYesClick()"
        cdkFocusInitial
      >
        Confirm
      </button>
      <button
        type="button"
        style="margin-right:10px; background-color: #f44336;  border: none; color: white; padding: 10px 10px; text-align: center;
          text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;"
        matTooltip="Delete"
        (click)="onNoClick()"
      >
        Cancel
      </button>
    </div>
  `,
})
export class ConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}

@Component({
  template: `
    <h1 mat-dialog-title>{{ data.title }}</h1>
    <div mat-dialog-content class="example-container">
      {{ data.message }}
    </div>
    <div mat-dialog-actions>
      <button
        mat-raised-button
        color="primary"
        (click)="onYesClick()"
        cdkFocusInitial
      >
        Ok
      </button>
    </div>
  `,
})
export class AlertDialog {
  constructor(
    public dialogRef: MatDialogRef<AlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
