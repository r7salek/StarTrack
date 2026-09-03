import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { TokenStorageService } from '../core/login/_services/token-storage.service';
import { CreateProjectService } from '../services/CreateProject.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DxDataGridComponent } from 'devextreme-angular';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProjectCreateDetailsComponent } from './ProjectCreateDetails/ProjectCreateDetails.component';
import { UpdateProjectComponent } from './updateProject/updateProject.component';
import { CreateProjectHistoryComponent } from './CreateProjectHistory/CreateProjectHistory.component';
import { Router } from '@angular/router';
import { UpdateProposalStatusComponent } from './UpdateProposalStatus/UpdateProposalStatus.component';

@Component({
  selector: 'app-CreateProjectManagement',
  templateUrl: './CreateProjectManagement.component.html',
  styleUrls: ['./CreateProjectManagement.component.scss'],
})
export class CreateProjectManagementComponent implements OnInit, AfterViewInit {
  // Configuration for the data grid's display settings
  readonly allowedPageSizes = [15, 25, 'all']; // Page size options for the data grid
  columnResizingMode!: string; // Data grid column resizing mode
  displayMode = 'full'; // Display mode of the grid
  showPageSizeSelector = true; // Show/hide the page size selector
  showInfo = true; // Display grid info
  expanded = false; // Whether grid rows are expanded
  groupBy = true; // Whether data is grouped
  showNavButtons: boolean = true; // Show navigation buttons
  allSelected = false; // Whether all rows are selected
  dataSource: any; // Data source for the grid
  @ViewChild(DxDataGridComponent, { static: false })
  dataGridInstance!: DxDataGridComponent; // Reference to the data grid component

  filterValue: Array<any> = []; // Filter values for grid
  customOperations!: Array<any>; // Custom filter operations
  popupPosition: any; // Popup position for dialogs
  @ViewChild('group') // Temporary boolean variable for grouping
  tmp: boolean = false;
  isLoading = true; // Loading indicator for the component
  value: any; // Generic value placeholder
  isShow = false; // Whether to show additional UI elements
  isDisabled: boolean = false; // Disable state for certain UI elements
  constructor(
    public notificationService: NotificationService, // Service for notifications and alerts
    private tokenStorageService: TokenStorageService, // Service for user session management
    public createProjectService: CreateProjectService, // Service for interacting with project API
    private dialog: MatDialog, // Material dialog service for modals
    private cdr: ChangeDetectorRef, // Change detection to update the view
    private router: Router // Router service for navigation
  ) {}
  /**
   * Toggles the expansion state of all grid rows.
   */
  collapseAllClick() {
    this.expanded = !this.expanded;
  }
  /**
   * Toggles grouping of the data in the grid and fetches updated data accordingly.
   */
  groupByClick() {
    this.groupBy = !this.groupBy;
    if (this.groupBy == false) {
      this.getProjectData();
    }
    if (this.groupBy == true) {
      this.getProjectDataLatest();
    }
  }
  /**
   * Adds a custom button to the data grid's toolbar.
   * @param e - Toolbar preparation event
   */
  onToolbarPreparing(e: any) {
    e.toolbarOptions.items.unshift({
      location: 'before',
      template: 'customButton',
    });
  }
  /**
   * Lifecycle hook - Called when the component is initialized.
   * Fetches the latest project data and sets up grid resizing.
   */
  ngOnInit() {
    this.getProjectDataLatest();
    window.addEventListener('resize', () => {
      if (this.dataGridInstance?.instance) {
        this.dataGridInstance.instance.updateDimensions();
      }
    });
  }
  /**
   * Lifecycle hook - Called after the component's view has been initialized.
   * Ensures the data grid dimensions are updated.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.dataGridInstance?.instance) {
        this.dataGridInstance.instance.updateDimensions();
      }
    }, 0);
  }
  /**
   * Calculates the height of the grid dynamically based on the number of rows.
   * @param rowCount - The number of rows in the grid
   * @returns A string representing the height in pixels
   */
  calculateGridHeight(rowCount: number): string {
    return `${Math.min(Math.max(800, 800), 800)}px`;
  }
  /**
   * Fetches the data for the project management grid (ungrouped data).
   */
  getProjectData() {
    this.createProjectService.getCreateProjectData().subscribe(
      (res1) => {
        this.dataSource = [...res1];
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }
  /**
   * Custom date formatter for displaying dates in DD/MM/YYYY format.
   * @param value - The date value to format
   * @returns A formatted date string
   */
  customDateFormatter = (value: any): string => {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  /**
   * Fetches the latest project data and processes it for display.
   * Converts certain string fields to arrays for compatibility.
   */
  getProjectDataLatest() {
    this.createProjectService.getCreateProjectDataLatest().subscribe(
      (res1) => {
        if (res1 && res1.length > 0) {
          res1.forEach((item) => {
            // Convert modality and areaOfExpertise strings to arrays
            if (typeof item.modality === 'string') {
              item.modality = item.modality.split(',');
            }
            if (typeof item.areaOfExpertise === 'string') {
              item.areaOfExpertise = item.areaOfExpertise.split(',');
            }
          });

          this.dataSource = res1; // Set main table data
        }
      },
      (error) => {
        console.error('Error fetching project data:', error);
      }
    );
  }
  /**
   * Opens a dialog to view the details of the selected project.
   */
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
  /**
   * Opens a dialog to view the history of the selected project.
   */
  viewHistory() {
    if (this.dataGridInstance.instance.getSelectedRowsData()[0]) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '90%';
      dialogConfig.height = '90%';
      dialogConfig.data = {
        dataKey:
          this.dataGridInstance.instance.getSelectedRowsData()[0].projectName,
      };
      this.dialog.open(CreateProjectHistoryComponent, dialogConfig);
    }
  }
  /**
   * Opens a dialog to update the status of the selected project.
   */
  updateStatus() {
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
  /**
   * Opens a dialog to update the selected project.
   * Cleans up data before populating the update form.
   */
  updateProject() {
    if (this.dataGridInstance.instance.getSelectedRowsData()[0]) {
      const selectedRowData =
        this.dataGridInstance.instance.getSelectedRowsData()[0];
      // Convert modality and areaOfExpertise to cleaned arrays
      if (Array.isArray(selectedRowData.modality)) {
        // Map over each element in the array and clean up the string
        const cleanedArray1 = selectedRowData.modality.map((element: string) =>
          element.replace(/^\[|]$/g, '').trim()
        );
        selectedRowData.modality = cleanedArray1;
        // Now cleanedArray contains the modified array of strings
      } else {
        console.error(
          'selectedRowData.modality is not an array or is in an unexpected format.'
        );
      }
      if (Array.isArray(selectedRowData.areaOfExpertise)) {
        // Map over each element in the array and clean up the string
        const cleanedArray2 = selectedRowData.areaOfExpertise.map(
          (element: string) => element.replace(/^\[|]$/g, '').trim()
        );
        selectedRowData.areaOfExpertise = cleanedArray2;
        // Now cleanedArray contains the modified array of strings
      } else {
        console.error(
          'selectedRowData.funding is not an array or is in an unexpected format.'
        );
      }
      this.createProjectService.populateForm(selectedRowData);
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '100%';
      dialogConfig.height = '90%';
      dialogConfig.data = { dataKey: selectedRowData };
      this.dialog.open(UpdateProjectComponent, dialogConfig);
    }
  }
  onDelete() {
    if (this.dataGridInstance.instance.getSelectedRowsData()[0]) {
      this.notificationService.confirmation(
        'Data will be deleted permanently ',
        () => {
          this.notificationService.success('Request Granted successfully');
          this.createProjectService
            .deletePermissions(
              this.dataGridInstance.instance.getSelectedRowsData()[0].id
            )
            .subscribe(
              () => {
                this.cdr.detectChanges();
              },
              (error: HttpErrorResponse) => {
                this.notificationService.error('Error occured');
              }
            );
          this.cdr.detectChanges();
          this.router.navigate(['CreateProjectManagement']).then(() => {
            window.location.reload();
          });
        },
        'Are you sure?',
        () => {
          this.notificationService.error('cancellation is confirmed');
        }
      );
    }
  }
}
