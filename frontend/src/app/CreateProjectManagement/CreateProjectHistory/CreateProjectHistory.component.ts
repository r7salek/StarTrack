import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogConfig,
} from '@angular/material/dialog';
import { DxDataGridComponent } from 'devextreme-angular';
import { NotificationService } from '../../services/notification.service';
import { CreateProjectService } from '../../services/CreateProject.service';
import { ProjectCreateDetailsComponent } from '../ProjectCreateDetails/ProjectCreateDetails.component';
import { UpdateProposalStatusComponent } from '../UpdateProposalStatus/UpdateProposalStatus.component';

@Component({
  selector: 'app-CreateProjectHistory',
  templateUrl: './CreateProjectHistory.component.html',
  styleUrls: ['./CreateProjectHistory.component.scss'],
})
export class CreateProjectHistoryComponent implements OnInit {
  readonly allowedPageSizes = [15, 25, 'all']; // Allowed page size options for the data grid
  columnResizingMode!: string; // Data grid column resizing mode
  displayMode = 'full'; // Display mode for the grid
  showPageSizeSelector = true; // Whether to display the page size selector
  showInfo = true; // Whether to display grid information
  expanded = false; // Indicates if all rows are expanded
  showNavButtons: boolean = true; // Whether to show navigation buttons in the grid
  allSelected = false; // Indicates if all rows are selected
  dataSource: any; // The data source for the grid
  @ViewChild(DxDataGridComponent, { static: false })
  dataGridInstance!: DxDataGridComponent; // Reference to the data grid component
  filterValue: Array<any> = []; // Stores filter values for custom filtering
  customOperations!: Array<any>; // Custom filter operations for advanced filtering

  popupPosition: any; // Popup position configuration
  @ViewChild('group')
  tmp: boolean = false; // Placeholder for grouping functionality
  isLoading = true; // Flag to indicate if data is still loading
  value: any; // Placeholder for any generic value
  isShow = false; // Whether to show additional UI components
  isDisabled: boolean = false; // Disable state for specific UI components
  constructor(
    public dialogRef: MatDialogRef<CreateProjectHistoryComponent>, // Reference to the dialog
    public notificationService: NotificationService, // Notification service
    public createProjectService: CreateProjectService, // Service for handling project-related API calls
    private dialog: MatDialog, // Service for opening dialog boxes
    private cdr: ChangeDetectorRef, // Change detector to trigger view updates
    @Inject(MAT_DIALOG_DATA) public data: any // Injected data passed to the dialog
  ) {}

  ngOnInit() {
    // Fetches the latest project data and sets up resize handling for the grid
    this.getProjectDataLatest();
    window.addEventListener('resize', () => {
      if (this.dataGridInstance?.instance) {
        this.dataGridInstance.instance.updateDimensions(); // Updates grid dimensions on resize
      }
    });
  }
  collapseAllClick() {
    // Toggles the expansion state of all rows in the grid
    this.expanded = !this.expanded;
  }
  onToolbarPreparing(e: any) {
    // Prepares a custom button for the data grid toolbar
    e.toolbarOptions.items.unshift({
      location: 'before',
      template: 'customButton',
    });
  }
  getProjectDataLatest() {
    // Fetches the history of a project using the provided data key
    this.createProjectService
      .getCreateProjectDataHistory(this.data.dataKey)
      .subscribe(
        (res1) => {
          this.dataSource = res1;
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
  }
  customDateFormatter = (value: any): string => {
    // Calculates the height of the grid dynamically based on the number of rows
    if (!value) {
      return '';
    }
    const date = new Date(value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  calculateGridHeight(rowCount: number): string {
    return `${Math.min(Math.max(800, 800), 800)}px`;
  }
  viewDetails() {
    if (this.dataGridInstance.instance.getSelectedRowsData()[0]) {
      const selectedRowData =
        this.dataGridInstance.instance.getSelectedRowsData()[0];
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '100%';
      dialogConfig.height = '90%';
      dialogConfig.data = { dataKey: selectedRowData };
      this.dialog.open(ProjectCreateDetailsComponent, dialogConfig);
    }
  }
  updateStatus() {
    // Opens a dialog to update the status of the selected project
    if (this.dataGridInstance.instance.getSelectedRowsData()[0]) {
      this.createProjectService.populateForm(
        this.dataGridInstance.instance.getSelectedRowsData()[0]
      );
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '50%';
      this.dialog.open(UpdateProposalStatusComponent, dialogConfig);
    }
  }
  onDelete() {
    // Deletes the selected project data after confirmation
    if (this.dataGridInstance.instance.getSelectedRowsData()[0]) {
      this.notificationService.confirmation(
        'Data will be deleted permanently ',
        () => {
          // On confirmation, proceed with deletion
          this.notificationService.success('Request Granted successfully');
          this.createProjectService
            .deletePermissions(
              this.dataGridInstance.instance.getSelectedRowsData()[0].id
            )
            .subscribe(
              () => {
                this.onClose(); // Closes the dialog after successful deletion
              },
              (error: HttpErrorResponse) => {
                this.notificationService.error('Error occured');
              }
            );
          this.cdr.detectChanges();
        },
        'Are you sure?',
        () => {
          // On cancellation, notify the user
          this.notificationService.error('cancellation is confirmed');
        }
      );
    }
  }
  onClose() {
    this.dialogRef.close();
  }
}
