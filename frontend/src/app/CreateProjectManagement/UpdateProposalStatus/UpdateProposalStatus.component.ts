import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { newProjectResponse } from '../../models/projectUpdate';
import { CreateProjectService } from '../../services/CreateProject.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-UpdateProposalStatus',
  templateUrl: './UpdateProposalStatus.component.html',
  styleUrls: ['./UpdateProposalStatus.component.scss'],
})
export class UpdateProposalStatusComponent implements OnInit {
  /**
   * Constructor to inject dependencies.
   * @param dialogRef - Reference to the dialog box, used to close it.
   * @param notificationService - Service for displaying notifications.
   * @param service - Service for handling API calls related to project updates.
   * @param _router - Router service for navigation.
   */
  constructor(
    public dialogRef: MatDialogRef<UpdateProposalStatusComponent>,
    public notificationService: NotificationService,
    public service: CreateProjectService,
    private _router: Router
  ) {}
  /**
   * Lifecycle hook - Initializes the component.
   */
  ngOnInit() {}
  // update values of permission and store into database
  public onUpdateUserPerm(id: number, applyValue: string): void {
    // Call the service method to update proposal permissions
    this.service.updateProposalPerm(id, applyValue).subscribe(
      (response: newProjectResponse) => {
        this.notificationService.success(
          ':: Permission is successfully updated'
        );
        this.dialogRef.close(true);
      },
      (error: HttpErrorResponse) => {
        this.notificationService.error(error.status === 409
          ? 'This project has changed. Close this dialog and reopen its latest version before changing the status.'
          : 'The status could not be saved.');
      }
    );
  }
  /**
   * Closes the dialog box without performing any actions.
   */
  onClose() {
    this.dialogRef.close();
  }
}
