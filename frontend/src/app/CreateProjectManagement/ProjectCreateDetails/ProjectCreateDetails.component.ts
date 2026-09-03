import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import jspdf, { jsPDF } from 'jspdf';
import { DateAdapter } from '@angular/material/core';
import { newProjectResponse } from '../../models/projectUpdate';
import { CreateProjectService } from '../../services/CreateProject.service';
import { NotificationService } from '../../services/notification.service';
import { TokenStorageService } from '../../core/login/_services/token-storage.service';

@Component({
  selector: 'app-ProjectCreateDetails',
  templateUrl: './ProjectCreateDetails.component.html',
  styleUrls: ['./ProjectCreateDetails.component.scss'],
})
export class ProjectCreateDetailsComponent implements OnInit, AfterViewInit {
  expandedRowIndices: number[] = []; // Tracks the indices of expanded rows in the data grid
  isGroupingEnabled = true; // Indicates whether grouping functionality is enabled in the data grid

  dynamicRowHeight: string = '1:1'; // Default row height ratio or size for dynamic rows
  dynamicRowHeight2: string = '1:1'; // Additional default row height ratio
  sumOverview!: number; // Holds the total sum for funding overview calculations
  sum!: number;

  // Data arrays for various components and entities
  dataSource: any[] = []; // Main data source for the grid
  collaboration: any[] = []; // Stores collaboration data
  groupMember: any[] = []; // Stores group member details
  team: any[] = []; // Stores team details
  scope: any[] = []; // Stores scope-related data
  advisor: any[] = []; // Stores advisor-related data
  subcontractor: any[] = []; // Stores subcontractor details
  ppi: any[] = []; // Stores PPI (Patient and Public Involvement) data
  otr: any[] = []; // Stores OTR (Other Technical Roles) data
  funding: any[] = []; // Stores funding details
  fundingOverview: any[] = []; // Stores funding overview data

  selectedModality!: string; // Tracks the currently selected modality
  currentUser: any; // Holds the current user information
  modalityOther!: string; // Holds additional information for "Other" modality
  otherInforPI!: string; // Additional information for Principal Investigator
  otherInforPostDoc!: string; // Additional information for PostDoc
  areaOfExpertiseOther!: string; // Additional information for "Other" area of expertise
  ttoContractOtherInfo!: string; // Additional information for TTO contract
  subContractorsOtherInfo!: string; // Additional subcontractor-related information
  fundingOther!: string; // Holds additional information for "Other" funding
  fundingNIHR!: string; // Holds NIHR-specific funding details
  fundingNIHROther!: string; // Additional NIHR-related funding information
  fundingUKRIMRC!: string; // Holds UKRI MRC-specific funding details
  fundingUKRIMRCOther!: string; // Additional UKRI MRC-related funding information

  // Funding overview-specific fields
  fundingOverviewOther!: string; // Additional information for "Other" funding overview
  fundingOverviewNIHR!: string; // NIHR-specific funding overview details
  fundingOverviewNIHROther!: string; // Additional NIHR-related funding overview information
  fundingOverviewUKRIMRC!: string; // UKRI MRC-specific funding overview details
  fundingOverviewUKRIMRCOther!: string; // Additional UKRI MRC-related funding overview information
  WellcomeTrustOverviewOther!: string; // Additional Wellcome Trust funding overview information
  fundingWellcomeOverviewTrust!: string; // Wellcome Trust-specific funding overview details

  WellcomeTrustOther!: string; // Additional Wellcome Trust-specific information
  fundingWellcomeTrust!: string; // Wellcome Trust-specific funding details
  collaborationOtherInfo!: string; // Additional information for collaborations
  selectedareaOfExpertise!: string; // Tracks the selected area of expertise
  selectedfundingGrants!: string; // Tracks the selected funding grants
  selectedfundingGrantsNIHR!: string; // Tracks NIHR-specific selected funding grants
  selectedfundingGrantsUKRIMRC!: string; // Tracks UKRI MRC-specific selected funding grants
  selectedfundingGrantsWellcomeTrust!: string; // Tracks Wellcome Trust-specific selected funding grants

  isProjectNameEditable: boolean = true; // Indicates whether the project name field is editable
  isFormReadOnly = true; // Indicates whether the form is in read-only mode
  selectedscheme!: string; // Tracks the selected scheme

  // ViewChild references for dynamic text areas and form container
  @ViewChild('dynamicTextarea')
  dynamicTextarea!: ElementRef<HTMLTextAreaElement>; // Reference for a dynamic text area
  @ViewChild('dynamicTextarea1')
  dynamicTextarea1!: ElementRef<HTMLTextAreaElement>; // Reference for another dynamic text area
  @ViewChild('formContainer', { static: false })
  formContainer!: ElementRef;
  AddToProjectUpdate: newProjectResponse = {} as newProjectResponse;
  gridHeight: number = 0; // Grid height for the main table
  gridHeight1: number = 0; // Grid height for another table or section
  constructor(
    public dialogRef: MatDialogRef<ProjectCreateDetailsComponent>, // Reference to the dialog component
    public notificationService: NotificationService, // Service for displaying notifications
    public createProjectService: CreateProjectService, // Service for project creation and management
    private dateAdapter: DateAdapter<Date>, // Adapter for handling date localization
    private tokenStorageService: TokenStorageService, // Service for managing user authentication and tokens
    private dialog: MatDialog, // Service for opening and managing dialogs
    private cdr: ChangeDetectorRef, // Service for manually triggering change detection
    @Inject(MAT_DIALOG_DATA) public data: any // Data injected into the dialog
  ) {
    dateAdapter.setLocale('en-de'); // DD/MM/YYYY
  }

  ngOnInit() {
    this.createProjectService
      .getGroupMemberById(this.data.dataKey.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.groupMember = res2;
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    this.createProjectService.getOutputById(this.data.dataKey.id).subscribe(
      (res2) => {
        if (!!res2) {
          this.dataSource = res2;
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
    this.createProjectService
      .getCollaborationById(this.data.dataKey.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.collaboration = res2;
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    this.createProjectService
      .getExternalAdvisorById(this.data.dataKey.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.advisor = res2;
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    this.createProjectService
      .getsubcontractorById(this.data.dataKey.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.subcontractor = res2;
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    this.createProjectService.getppiById(this.data.dataKey.id).subscribe(
      (res2) => {
        if (!!res2) {
          this.ppi = res2;
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
    this.createProjectService.getotrById(this.data.dataKey.id).subscribe(
      (res2) => {
        if (!!res2) {
          this.otr = res2;
        }
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
    // Get the funding rows
    this.createProjectService.getFundingById(this.data.dataKey.id).subscribe(
      (res2) => {
        this.funding = res2;
        this.sum = this.funding.reduce(
          (sum: any, row: { value: any }) => sum + row.value,
          0
        );
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
    // Get the funding overview rows
    this.createProjectService
      .getFundingOverviewById(this.data.dataKey.id)
      .subscribe(
        (res2) => {
          this.fundingOverview = res2;
          this.sumOverview = this.fundingOverview.reduce(
            (sumOverview: any, row: { valueOverview: any }) =>
              sumOverview + row.valueOverview,
            0
          );
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    //this.calculateSum();
    this.AddToProjectUpdate = this.data;
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      createdEmail: this.data.dataKey.createdEmail,
      createdDate: this.data.dataKey.createdDate,
      modifyEmail: this.data.dataKey.modifyEmail,
      projectName: this.data.dataKey.projectName,
      lastNamePI: this.data.dataKey.lastNamePI,
      firstNamePI: this.data.dataKey.firstNamePI,
      emailPI: this.data.dataKey.emailPI,
      departmentPI: this.data.dataKey.departmentPI,
      crsidPI: this.data.dataKey.crsidPI,
      otherInforPI: this.data.dataKey.otherInforPI,
      // ... (repeat for other fields in this.form)
    };
    // Copy values from this.form1 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      ttoContractName: this.data.dataKey.ttoContractName,
      ttoContractEmail: this.data.dataKey.ttoContractEmail,
      ttoContractOtherInfo: this.data.dataKey.ttoContractOtherInfo,
    };
    // Copy values from this.form2 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      // funding: this.data.dataKey.funding,
    };
    // Copy values from this.form3 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      modality: this.data.dataKey.modality,
      modalityOther: this.data.dataKey.modalityOther,
      areaOfExpertise: this.data.dataKey.areaOfExpertise,
      areaOfExpertiseOther: this.data.dataKey.areaOfExpertiseOther,
      readiness: this.data.dataKey.readiness,
      briefDescription: this.data.dataKey.briefDescription,
      projectBackground: this.data.dataKey.projectBackground,
    };
    this.cdr.detectChanges();
  }
  ngAfterViewInit(): void {
    // Ensure height adjustment after view initialization
    if (this.dynamicTextarea) {
      this.adjustHeight();
    }
    // Ensure height adjustment after view initialization
    if (this.dynamicTextarea1) {
      this.adjustHeight1();
    }
  }
  isfundingOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { fundingOther: any }) => !!item.fundingOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingNIHROtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { fundingNIHROther: any }) => !!item.fundingNIHROther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingUKRIMRCVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { fundingUKRIMRC: any }) => !!item.fundingUKRIMRC
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingUKRIMRCOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { fundingUKRIMRCOther: any }) => !!item.fundingUKRIMRCOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingWellcomeTrustVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { fundingWellcomeTrust: any }) => !!item.fundingWellcomeTrust
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingWellcomeTrustOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { fundingWellcomeTrustOther: any }) =>
          !!item.fundingWellcomeTrustOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
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
  isschemeOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { schemeOther: any }) => !!item.schemeOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingNIHRVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.funding && this.funding.length > 0) {
      return this.funding.some(
        (item: { fundingNIHR: any }) => !!item.fundingNIHR
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  // Funding OVerview visible logic

  isfundingOverviewOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { fundingOverviewOther: any }) => !!item.fundingOverviewOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingOverviewNIHROtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { fundingOverviewNIHROther: any }) =>
          !!item.fundingOverviewNIHROther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingOverviewUKRIMRCVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { fundingOverviewUKRIMRC: any }) => !!item.fundingOverviewUKRIMRC
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingOverviewUKRIMRCOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { fundingOverviewUKRIMRCOther: any }) =>
          !!item.fundingOverviewUKRIMRCOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingOverviewWellcomeTrustVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { fundingOverviewWellcomeTrust: any }) =>
          !!item.fundingOverviewWellcomeTrust
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingOverviewWellcomeTrustOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { fundingOverviewWellcomeTrustOther: any }) =>
          !!item.fundingOverviewWellcomeTrustOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isschemeOverviewOtherVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { schemeOverviewOther: any }) => !!item.schemeOverviewOther
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  isfundingOverviewNIHRVisible(): boolean {
    // Ensure funding array is initialized and not null
    if (this.fundingOverview && this.fundingOverview.length > 0) {
      return this.fundingOverview.some(
        (item: { fundingOverviewNIHR: any }) => !!item.fundingOverviewNIHR
      );
    } else {
      return false; // Return false if funding array is empty or null
    }
  }
  calculateGridHeight(rowCount: number | undefined): string {
    if (!rowCount) {
      return '400px'; // Default height when data is not yet loaded
    }
    const rowHeight = 50; // Approximate row height in pixels
    const headerHeight = 60; // Header height in pixels
    return `${rowCount * rowHeight + headerHeight}px`;
  }
  calculateGridHeightAims(rowCount: number | undefined): string {
    if (!rowCount || rowCount === 0) {
      return '200px'; // Default height if no rows exist
    }

    const defaultRowHeight = 50; // Default row height
    const expandedRowExtraHeight = 100; // Additional height for expanded rows with large text
    const headerHeight = 60; // Grid header height
    const footerHeight = 40; // Grid footer or additional element height
    const groupHeaderHeight = 30; // Group header height if grouping is enabled
    const additionalPadding = 20; // Extra padding or spacing
    const otherElementsHeight = headerHeight + footerHeight + additionalPadding;

    // Get the count of expanded rows (if you're tracking this dynamically)
    const expandedRowsCount = this.expandedRowIndices?.length || 0;

    // Total height based on row count, expanded rows, and group headers
    const contentHeight =
      rowCount * defaultRowHeight +
      expandedRowsCount * expandedRowExtraHeight +
      otherElementsHeight +
      (this.isGroupingEnabled ? groupHeaderHeight * rowCount : 0);

    // Ensure height fits within the viewport but respects content size
    const viewportHeight = window.innerHeight - additionalPadding;
    const gridHeight = Math.min(contentHeight, viewportHeight);

    return `${gridHeight}px`;
  }

  calculateGridHeightAims2(rowCount: number | undefined): string {
    if (!rowCount || rowCount === 0) {
      return '200px'; // Default height if no rows exist
    }

    const rowHeight = 50; // Row height in pixels
    const groupHeaderHeight = 30; // Height for group header rows
    const headerHeight = 60; // Header height
    const footerHeight = 40; // Footer height or other elements
    const otherElementsHeight = headerHeight + footerHeight;

    // Calculate the number of unique group headers
    const groupCount = this.funding.filter(
      (v, i, a) => a.findIndex((t) => t.aims === v.aims) === i
    ).length;

    // Total height needed for rows and group headers
    const contentHeight =
      rowCount * rowHeight +
      groupCount * groupHeaderHeight +
      otherElementsHeight;

    // Calculate available viewport height
    const viewportHeight = window.innerHeight - 20; // Subtract 20px for padding/margin

    // Calculate grid height based on content and viewport, avoiding scrollbars
    const gridHeight = Math.max(
      contentHeight,
      Math.min(viewportHeight, document.body.clientHeight)
    );

    return `${gridHeight}px`;
  }
  adjustHeight(): void {
    if (this.dynamicTextarea) {
      let totalHeight = 0;
      const textarea = this.dynamicTextarea.nativeElement;
      textarea.style.height = 'auto'; // Reset to calculate the new scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height to fit the content
      totalHeight += textarea.scrollHeight + 30;
      this.gridHeight = totalHeight;
      this.dynamicRowHeight = `${textarea.scrollHeight + 40}px`;
      this.cdr.detectChanges();
    }
  }
  adjustHeight1(): void {
    if (this.dynamicTextarea1) {
      let totalHeight = 0;
      const textarea = this.dynamicTextarea1.nativeElement;
      textarea.style.height = 'auto'; // Reset to calculate the new scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height to fit the content
      totalHeight += textarea.scrollHeight + 30;
      this.gridHeight1 = totalHeight;
      this.dynamicRowHeight2 = `${textarea.scrollHeight + 150}px`;
      this.cdr.detectChanges();
    }
  }
  makePDF() {
    this.currentUser = this.tokenStorageService.getUser();

    var quotes = document.getElementById('contentToConvert');
    if (!!quotes) {
      // Select all textareas inside the contentToConvert
      var textareas = quotes.querySelectorAll('textarea');
      quotes.style.fontSize = '28px'; // Adjust font size here
      quotes.style.backgroundColor = '#ffffff';
      quotes.style.visibility = 'visible';
      quotes.style.opacity = '1';
      // Temporarily replace textareas with their content for PDF conversion
      textareas.forEach((textarea) => {
        var textContent = document.createElement('div');
        textContent.textContent = textarea.value; // Insert textarea value as text content
        textContent.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
        textarea.style.display = 'none'; // Hide textarea
        textarea.parentNode?.insertBefore(textContent, textarea); // Insert the text content before the textarea
      });
      html2canvas(quotes, {
        scale: 4, // Lower scale to optimize size
        useCORS: true,
        backgroundColor: '#ffffff',
      }).then((canvas) => {
        var imgData = canvas.toDataURL('image/jpeg', 1.0);
        var imgWidth = 208;
        var pageHeight = 295;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var heightLeft = imgHeight;

        var topMargin = 25;
        var bottomMargin = 25;
        var contentHeight = pageHeight - topMargin - bottomMargin;

        var doc = new jsPDF('p', 'mm');
        var position = topMargin;
        var currentHeight = 0;

        var today = new Date();
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var year = today.getFullYear();
        var todayDate = `${day}.${month}.${year}`;
        var proposal = this.data.dataKey.projectName;
        if (!!this.currentUser) {
          var firstName = this.currentUser.firstName;
          var lastName = this.currentUser.lastName;
        }

        var totalPages = 0;
        while (heightLeft > 0) {
          heightLeft -= contentHeight;
          totalPages++;
        }

        heightLeft = imgHeight;
        currentHeight = 0;
        position = topMargin;

        function addHeaderFooter(page: number) {
          // Header dimensions
          const headerX = 8; // Left margin
          const headerY = 8; // Top margin
          const headerWidth = 194; // Page width minus margins
          const headerHeight = 12; // Reduced height of the header box

          // Draw header box
          doc.rect(headerX, headerY, headerWidth, headerHeight); // Outer header rectangle

          // Add header text
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text('Created at:', 15, 15); // Text in the first section
          doc.text(todayDate, 40, 15); // Date in the first section
          doc.text('Created by:', 98, 15); // Text in the second section
          doc.text(firstName + ' ' + lastName, 120, 15); // Name in the second section

          // Add footer
          doc.line(8, 280, 200, 280); // Line above the footer
          doc.setFontSize(10);
          doc.text('StarTrack', 25, 285, { align: 'center' }); // Footer text
          doc.text(`Page ${page}/${totalPages}`, 190, 285); // Page number in footer
        }

        var pageCount = 1;
        while (heightLeft > 0) {
          var canvasPage = document.createElement('canvas');
          var context = canvasPage.getContext('2d');
          canvasPage.width = canvas.width;
          canvasPage.height = Math.min(
            canvas.height - currentHeight,
            contentHeight * (canvas.width / imgWidth)
          );

          context!.drawImage(
            canvas,
            0,
            currentHeight,
            canvas.width,
            canvasPage.height,
            0,
            0,
            canvas.width,
            canvasPage.height
          );

          var imgDataPage = canvasPage.toDataURL('image/jpeg');
          doc.addImage(
            imgDataPage,
            'JPEG',
            2,
            position,
            imgWidth,
            (canvasPage.height * imgWidth) / canvas.width
          );

          addHeaderFooter(pageCount);
          pageCount++;

          currentHeight += canvasPage.height;
          heightLeft -= contentHeight;

          if (heightLeft > 0) {
            doc.addPage();
            position = topMargin;
          }
        }

        doc.save(proposal + '.pdf');
        // Restore textareas visibility
        document.querySelectorAll('textarea').forEach((textarea) => {
          textarea.style.display = 'block'; // Show textareas again
          textarea.previousSibling?.remove(); // Remove the inserted div
        });
      });
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
