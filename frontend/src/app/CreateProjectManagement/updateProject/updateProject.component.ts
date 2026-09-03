import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import html2canvas from 'html2canvas';
import jspdf, { jsPDF } from 'jspdf';
import { NotificationService } from '../../services/notification.service';
import { CreateProjectService } from '../../services/CreateProject.service';
import { newProject } from '../../models/projectUpdate';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenStorageService } from '../../core/login/_services/token-storage.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
@Component({
  selector: 'app-updateProject',
  templateUrl: './updateProject.component.html',
  styleUrls: ['./updateProject.component.scss'],
})
export class UpdateProjectComponent implements OnInit, AfterViewInit {
  // Component-wide data arrays
  dataSource: any[] = [];
  collaboration: any[] = [];
  groupMember: any[] = [];
  team: any[] = [];
  scope: any[] = [];
  advisor: any[] = [];
  subcontractor: any[] = [];
  ppi: any[] = [];
  otr: any[] = [];
  funding: any[] = [];
  fundingOverview: any[] = [];
  // Editor and max character limit options
  nameEditorOptions!: Object;
  maxChars1 = 65000;
  // Variables for tracking specific funding selections and user information
  modalityOther!: string;
  selectedfundingGrants: string[] = [];
  selectedfundingscheme: string[] = [];
  selectedfundingGrantsNIHR: string[] = [];
  selectedfundingGrantsUKRIMRC: string[] = [];
  selectedfundingGrantsWellcomeTrust: string[] = [];

  // funding Overview
  selectedfundingGrantsOverview: string[] = [];
  selectedfundingOverviewscheme: string[] = [];
  selectedfundingGrantsOverviewNIHR: string[] = [];
  selectedfundingGrantsOverviewUKRIMRC: string[] = [];
  selectedfundingGrantsOverviewWellcomeTrust: string[] = [];

  isFormReadOnly = true;
  otherInforPI!: string;
  otherInforPostDoc!: string;
  areaOfExpertiseOther!: string;
  ttoContractOtherInfo!: string;
  subContractorsOtherInfo!: string;
  fundingOther!: string;
  fundingNIHR!: string;
  fundingNIHROther!: string;
  fundingUKRIMRC!: string;
  fundingUKRIMRCOther!: string;
  WellcomeTrustOther!: string;
  fundingWellcomeTrust!: string;

  // funding Overview
  fundingOverviewOther!: string;
  fundingOverviewNIHR!: string;
  fundingOverviewNIHROther!: string;
  fundingOverviewUKRIMRC!: string;
  fundingOverviewUKRIMRCOther!: string;
  WellcomeTrustOverviewOther!: string;
  fundingWellcomeOverviewTrust!: string;

  collaborationOtherInfo!: string;
  columnResizingMode!: string;
  currentUser: any; // variable for current user
  sum!: number; // Sum for funding
  sumOverview!: number; // Sum for funding overview
  AddToProjectUpdate: newProject = {} as newProject;

  @ViewChild('formContainer', { static: false })
  formContainer!: ElementRef;
  @ViewChild('autosize') autosize!: CdkTextareaAutosize;
  // Values for form options and dropdowns
  public outputValue = [
    'Publications',
    'Patent(s)',
    'Licence(s)',
    'Spinout (registered?)',
    'Other (please specify)',
  ];
  public collaborationValue = ['Academic', 'Industry', 'NHS', 'Other', 'None'];
  public confirmationValue = ['YES', 'NO'];
  public positionValue = ['PHD', 'POSTDOC'];
  maxChars3!: 65000;
  public collaborationLocationValue = [
    'Cambridge',
    'National',
    'International',
  ];
  public fundingValue = [
    'UKRI-MRC',
    'UKRI-EPSRC',
    'other UKRI',
    'Innovate UK',
    'NIHR',
    'Wellcome Trust',
    'BHF',
    'LifeArc',
    'Eu-Horizon',
    'Other (please specify)',
  ];
  public fundingNIHRValue = [
    'EME',
    'HTA',
    'i4i Challenge',
    'i4i Conenct',
    'i4i Fast',
    'i4i PDA',
    'Other (please specify)',
  ];
  public fundingUKRIMRCValue = [
    'CIC/IAA',
    'DPFS',
    'DPGF',
    'Exp Med',
    'Other (please specify)',
  ];
  public fundingWellcomeTrustValue = ['WT-DCF', 'Other (please specify)'];
  public schemeValue = [
    'WT-DCF',
    'MRC - CiC/IAA',
    'MRC - DPFS',
    'MRC - DPGF',
    'MRC - Exp Med',
    'NIHR - BRC',
    'NIHR - EME',
    'NIHR - HTA',
    'NIHR i4i Challenge',
    'NIHR i4i Connect',
    'NIHR i4i Fast',
    'NIHR i4i PDA',
    'Other (please specify)',
  ];
  constructor(
    public dialogRef: MatDialogRef<UpdateProjectComponent>, // Dialog reference
    public notificationService: NotificationService, // Notification service
    private dialog: MatDialog, // For opening modal dialogs
    public createProjectService: CreateProjectService, // Service for managing projects
    private tokenStorageService: TokenStorageService, // Service responsible to get data from token
    private cdr: ChangeDetectorRef, // Change detection
    private dateAdapter: DateAdapter<Date>, // Date adapter for localization
    @Inject(MAT_DIALOG_DATA) public data: any, // Injected data for the dialog
    private fb: FormBuilder // Form builder for reactive forms
  ) {
    dateAdapter.setLocale('en-de'); // DD/MM/YYYY
    this.currentUser = this.tokenStorageService.getUser(); // Retrieve current user details
  }

  ngOnInit() {
    // Fetch and initialize group members
    this.createProjectService
      .getGroupMemberById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.initializeGroupMemberRows(res2);
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    // Fetch and initialize outputs
    this.createProjectService
      .getOutputById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.initializeSamplesRows(res2);
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    // Fetch and initialize collaborations
    this.createProjectService
      .getCollaborationById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.initializeCollaborationRows(res2);
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    this.createProjectService
      .getExternalAdvisorById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.initializeExternalAdvisorRows(res2);
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    // Fetch and initialize subcontractor
    this.createProjectService
      .getsubcontractorById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.initializeSubcontractorRows(res2);
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    // Fetch and initialize ppi
    this.createProjectService
      .getppiById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.initializePpiRows(res2);
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    this.createProjectService
      .getotrById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          if (!!res2) {
            this.initializeOtrRows(res2);
          }
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    // Get the funding rows
    this.createProjectService
      .getFundingById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          // Iterate through the res2 array
          for (const item of res2) {
            // Check if 'funding' property exists and is a string
            if (item.funding && typeof item.funding === 'string') {
              const fundingString = item.funding as string;

              // Remove square brackets and whitespace from the string, then split by commas
              const fundingArray = fundingString
                .replace(/\[|\]/g, '')
                .split(',')
                .map((funding: string) => funding.trim());

              // Update the 'funding' property of the item with the fundingArray
              item.funding = fundingArray;
            }
          }

          this.initializeFundingRows(res2);
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    // Get the funding overview rows
    this.createProjectService
      .getFundingOverviewById(this.createProjectService.form.value.id)
      .subscribe(
        (res2) => {
          // Iterate through the res2 array
          for (const item of res2) {
            // Check if 'funding' property exists and is a string
            if (
              item.fundingOverview &&
              typeof item.fundingOverview === 'string'
            ) {
              const fundingString = item.fundingOverview as string;

              // Remove square brackets and whitespace from the string, then split by commas
              const fundingArray = fundingString
                .replace(/\[|\]/g, '')
                .split(',')
                .map((fundingOverview: string) => fundingOverview.trim());

              // Update the 'funding' property of the item with the fundingArray
              item.fundingOverview = fundingArray;
            }
          }

          this.initializeFundingOverviewRows(res2);
        },
        (error: HttpErrorResponse) => {
          alert(error.message);
        }
      );
    this.cdr.detectChanges(); // Trigger change detection to update the view
  }
  ngAfterViewInit(): void {
    // Adjust width after the view initializes
  }
  // Function to initialize the GroupMember FormArray
  initializeGroupMemberRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form.get(
      'groupMemberRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any

    for (const item of res2) {
      const sampleRow = this.fb.group({
        lastNamePostDoc: [item.lastNamePostDoc],
        firstNamePostDoc: [item.firstNamePostDoc],
        emailPostDoc: [item.emailPostDoc],
        departmentPostDoc: [item.departmentPostDoc],
        positionPostDoc: [item.positionPostDoc],
        crsidPostDoc: [item.crsidPostDoc],
        otherInforPostDoc: [item.otherInforPostDoc],
      });

      samplesRowsArray.push(sampleRow);
    }
  }
  // Function to initialize the samplesRows FormArray
  initializeSamplesRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form2.get(
      'outputRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any

    for (const item of res2) {
      const sampleRow = this.fb.group({
        output: [item.output, Validators.required],
        confirmation: [item.confirmation, Validators.required],
        outputQuantity: [item.outputQuantity],
        output_description: [item.output_description],
      });

      samplesRowsArray.push(sampleRow);
    }
  }
  // Function to initialize the samplesRows FormArray
  initializeCollaborationRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form1.get(
      'collaborationRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any

    for (const item of res2) {
      const sampleRow = this.fb.group({
        collaboration: [item.collaboration, Validators.required],
        collaborationName: [item.collaborationName],
        collaborationEmail: [item.collaborationEmail],
        collaborationLocation: [item.collaborationLocation],
        collaborationOtherInfo: [item.collaborationOtherInfo],
      });

      samplesRowsArray.push(sampleRow);
    }
  }
  initializeExternalAdvisorRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form1.get(
      'externalAdvisorRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any

    for (const item of res2) {
      const sampleRow = this.fb.group({
        externalAdvisorsMeeting: [item.externalAdvisorsMeeting],
        externalAdvisorsOrganisation: [item.externalAdvisorsOrganisation],
        externalAdvisorsName: [item.externalAdvisorsName],
        externalAdvisorsEmail: [item.externalAdvisorsEmail],
        externalAdvisorsOutcome: [item.externalAdvisorsOutcome],
        externalAdvisorsExpertise: [item.externalAdvisorsExpertise],
      });

      samplesRowsArray.push(sampleRow);
    }
  }
  initializeSubcontractorRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form1.get(
      'subContractorsRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any

    for (const item of res2) {
      const sampleRow = this.fb.group({
        subContractorsName: [item.subContractorsName],
        subContractorsEmail: [item.subContractorsEmail],
        subContractorsExpertise: [item.subContractorsExpertise],
        subContractorsOrganisation: [item.subContractorsOrganisation],
        subContractorsOtherInfo: [item.subContractorsOtherInfo],
      });

      samplesRowsArray.push(sampleRow);
    }
  }
  // OTR data
  initializeOtrRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form4.get(
      'otrRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any

    for (const item of res2) {
      const sampleRow = this.fb.group({
        otrTeamMember: [item.otrTeamMember],
        otrRole: [item.otrRole],
        otrFunding: [item.otrFunding],
        otrDate: [item.otrDate],
        otrOtherInfo: [item.otrOtherInfo],
      });

      samplesRowsArray.push(sampleRow);
    }
  }
  //PPI data
  initializePpiRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form1.get(
      'ppiRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any

    for (const item of res2) {
      const sampleRow = this.fb.group({
        ppiMeeting: [item.ppiMeeting],
        ppiContact: [item.ppiContact],
        ppiGroup: [item.ppiGroup],
        ppiOutcome: [item.ppiOutcome],
      });

      samplesRowsArray.push(sampleRow);
    }
  }
  // funding intialization
  initializeFundingRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form2.get(
      'fundingRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any
    for (const item of res2) {
      const sampleRow = this.fb.group({
        funding: [item.funding], // Use the array directly
        fundingOther: [item.fundingOther],
        fundingNIHR: [item.fundingNIHR],
        fundingNIHROther: [item.fundingNIHROther],
        fundingUKRIMRC: [item.fundingUKRIMRC],
        fundingUKRIMRCOther: [item.fundingUKRIMRCOther],
        fundingWellcomeTrust: [item.fundingWellcomeTrust],
        fundingWellcomeTrustOther: [item.fundingWellcomeTrustOther],
        scheme: [item.scheme],
        schemeOther: [item.schemeOther],
        value: [item.value],
        fundingStartDate: [item.fundingStartDate],
        fundingEndDate: [item.fundingEndDate],
        aims: [item.aims],
        grantNumber: [item.grantNumber],
        worktribeNumber: [item.worktribeNumber],
      });

      samplesRowsArray.push(sampleRow);
      this.cdr.detectChanges();
    }
  }
  // funding Overview intialization
  initializeFundingOverviewRows(res2: any[]) {
    const samplesRowsArray = this.createProjectService.form5.get(
      'fundingOverviewRows'
    ) as FormArray;
    samplesRowsArray.clear(); // Clear existing controls if any
    for (const item of res2) {
      const sampleRow = this.fb.group({
        fundingOverview: [item.fundingOverview], // Use the array directly
        fundingOverviewOther: [item.fundingOverviewOther],
        fundingOverviewNIHR: [item.fundingOverviewNIHR],
        fundingOverviewNIHROther: [item.fundingOverviewNIHROther],
        fundingOverviewUKRIMRC: [item.fundingOverviewUKRIMRC],
        fundingOverviewUKRIMRCOther: [item.fundingOverviewUKRIMRCOther],
        fundingOverviewWellcomeTrust: [item.fundingOverviewWellcomeTrust],
        fundingOverviewWellcomeTrustOther: [
          item.fundingOverviewWellcomeTrustOther,
        ],
        schemeOverview: [item.schemeOverview],
        schemeOverviewOther: [item.schemeOverviewOther],
        valueOverview: [item.valueOverview],
        fundingOverviewStartDate: [item.fundingOverviewStartDate],
        fundingOverviewEndDate: [item.fundingOverviewEndDate],
        aimsOverview: [item.aimsOverview],
        grantNumberOverview: [item.grantNumberOverview],
        worktribeNumberOverview: [item.worktribeNumberOverview],
      });

      samplesRowsArray.push(sampleRow);

      this.cdr.detectChanges();
    }
  }
  onSelectFundingschemeFunder(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form2.get(
      'fundingRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const schemeOtherControl = formGroup.get('schemeOther');
    if (value && !value.includes('Other (please specify)')) {
      schemeOtherControl?.reset();
    }
  }
  onSelectFundingGrantsFunder(index: number, value: any[]) {
    // const formGroup = this.createProjectService.form2.get('fundingRows')?.controls[index] as FormGroup;
    const fundingRowsArray = this.createProjectService.form2.get(
      'fundingRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;

    if (value && !value.includes('UKRI-MRC')) {
      const fundingUKRIMRCControl = formGroup.get('fundingUKRIMRC');
      const fundingUKRIMRCOtherControl = formGroup.get('fundingUKRIMRCOther');
      fundingUKRIMRCControl?.reset();
      fundingUKRIMRCOtherControl?.reset();
    }

    if (value && !value.includes('Other (please specify)')) {
      const fundingfundingOtherControl = formGroup.get('fundingOther');
      fundingfundingOtherControl?.reset();
    }
    if (value && !value.includes('NIHR')) {
      const fundingNIHRControl = formGroup.get('fundingNIHR');
      const fundingNIHROtherControl = formGroup.get('fundingNIHROther');
      fundingNIHRControl?.reset();
      fundingNIHROtherControl?.reset();
    }
    if (value && !value.includes('Wellcome Trust')) {
      const fundingWellcomeTrustControl = formGroup.get('fundingWellcomeTrust');
      const fundingWellcomeTrustOtherControl = formGroup.get(
        'fundingWellcomeTrustOther'
      );
      fundingWellcomeTrustControl?.reset();
      fundingWellcomeTrustOtherControl?.reset();
    }
    this.cdr.detectChanges();
  }
  onSelectFundingGrantsFunderNIHR(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form2.get(
      'fundingRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const fundingNIHROtherControl = formGroup.get('fundingNIHROther');
    if (
      fundingNIHROtherControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingNIHROtherControl.reset();
    }
  }
  onSelectFundingGrantsFunderUKRIMRC(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form2.get(
      'fundingRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const fundingUKRIMRCOtherControl = formGroup.get('fundingUKRIMRCOther');
    if (
      fundingUKRIMRCOtherControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingUKRIMRCOtherControl.reset();
    }
  }
  onSelectFundingGrantsFunderWellcomeTrust(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form2.get(
      'fundingRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const fundingWellcomeTrustControl = formGroup.get('fundingWellcomeTrust');
    if (
      fundingWellcomeTrustControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingWellcomeTrustControl.reset();
    }
  }
  onSelectFundingGrantsScheme(value: any) {
    if (value && !value.includes('Other (please specify)')) {
      this.createProjectService.form.get('scheme1')?.reset();
    }
  }
  onSelectAreaOfExpertise(value: any[]) {
    if (value && !value.includes('Other (please specify)')) {
      this.createProjectService.form3.get('areaOfExpertise1')?.reset();
    }
  }
  onSelectModality(value: any[]) {
    if (value && !value.includes('Other (please specify)')) {
      this.createProjectService.form3.get('modality1')?.reset();
    }
  }
  // funding overview
  // funding overview
  onSelectFundingGrantsFunderOverview(index: number, value: any[]) {
    const fundingRowsArray = this.createProjectService.form5.get(
      'fundingOverviewRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;

    if (value && !value.includes('UKRI-MRC')) {
      const fundingUKRIMRCControl = formGroup.get('fundingOverviewUKRIMRC');
      const fundingUKRIMRCOtherControl = formGroup.get(
        'fundingOverviewUKRIMRCOther'
      );
      fundingUKRIMRCControl?.reset();
      fundingUKRIMRCOtherControl?.reset();
    }

    if (value && !value.includes('Other (please specify)')) {
      const fundingfundingOtherControl = formGroup.get('fundingOverviewOther');
      fundingfundingOtherControl?.reset();
    }
    if (value && !value.includes('NIHR')) {
      const fundingNIHRControl = formGroup.get('fundingOverviewNIHR');
      const fundingNIHROtherControl = formGroup.get('fundingOverviewNIHROther');
      fundingNIHRControl?.reset();
      fundingNIHROtherControl?.reset();
    }
    if (value && !value.includes('Wellcome Trust')) {
      const fundingWellcomeTrustControl = formGroup.get(
        'fundingOverviewWellcomeTrust'
      );
      const fundingWellcomeTrustOtherControl = formGroup.get(
        'fundingOverviewWellcomeTrustOther'
      );
      fundingWellcomeTrustControl?.reset();
      fundingWellcomeTrustOtherControl?.reset();
    }
    this.cdr.detectChanges();
  }

  onSelectFundingGrantsFunderOverviewNIHR(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form5.get(
      'fundingOverviewRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const fundingNIHROtherControl = formGroup.get('fundingOverviewNIHROther');
    if (
      fundingNIHROtherControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingNIHROtherControl.reset();
    }
    this.cdr.detectChanges();
  }

  onSelectFundingGrantsFunderOverviewUKRIMRC(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form5.get(
      'fundingOverviewRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const fundingUKRIMRCOtherControl = formGroup.get(
      'fundingOverviewUKRIMRCOther'
    );
    if (
      fundingUKRIMRCOtherControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingUKRIMRCOtherControl.reset();
    }
    this.cdr.detectChanges();
  }

  onSelectFundingGrantsOverviewFunderWellcomeTrust(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form5.get(
      'fundingOverviewRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const fundingWellcomeTrustControl = formGroup.get(
      'fundingOverviewWellcomeTrust'
    );
    if (
      fundingWellcomeTrustControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingWellcomeTrustControl.reset();
    }
    this.cdr.detectChanges();
  }
  onSelectFundingOverviewGrantsScheme(index: number, value: any) {
    const fundingRowsArray = this.createProjectService.form5.get(
      'fundingOverviewRows'
    ) as FormArray;
    const formGroup = fundingRowsArray.at(index) as FormGroup;
    const schemeOtherControl = formGroup.get('schemeOverviewOther');
    if (value && !value.includes('Other (please specify)')) {
      schemeOtherControl?.reset();
    }
  }
  combineData() {
    if (this.createProjectService.form.get('otherInforPI')?.value !== '') {
      this.otherInforPI =
        this.createProjectService.form.get('otherInforPI')?.value;
    }
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      projectName: this.createProjectService.form.get('projectName')?.value,
      lastNamePI: this.createProjectService.form.get('lastNamePI')?.value,
      firstNamePI: this.createProjectService.form.get('firstNamePI')?.value,
      emailPI: this.createProjectService.form.get('emailPI')?.value,
      departmentPI: this.createProjectService.form.get('departmentPI')?.value,
      crsidPI: this.createProjectService.form.get('crsidPI')?.value,
      otherInforPI: this.otherInforPI,
      groupMemberRows: this.createProjectService.form.value.groupMemberRows,
      // ... (repeat for other fields in this.form)
    };
    // this.AddToProjectUpdate = defaultNewProject;
    if (
      this.createProjectService.form1.get('ttoContractOtherInfo')?.value !== ''
    ) {
      this.ttoContractOtherInfo = this.createProjectService.form1.get(
        'ttoContractOtherInfo'
      )?.value;
    }
    if (
      this.createProjectService.form1.get('subContractorsOtherInfo')?.value !==
      ''
    ) {
      this.subContractorsOtherInfo = this.createProjectService.form1.get(
        'subContractorsOtherInfo'
      )?.value;
    }
    // Copy values from this.form1 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      collaborationRows:
        this.createProjectService.form1.value.collaborationRows,
      externalAdvisorsRows:
        this.createProjectService.form1.value.externalAdvisorRows,
      ttoContractName:
        this.createProjectService.form1.get('ttoContractName')?.value,
      ttoContractEmail:
        this.createProjectService.form1.get('ttoContractEmail')?.value,
      ttoContractOtherInfo: this.ttoContractOtherInfo,
      subContractorsRows:
        this.createProjectService.form1.value.subContractorsRows,
      ppiRows: this.createProjectService.form1.value.ppiRows,
      otrRows: this.createProjectService.form4.value.otrRows,
    };
    // Copy values from this.form2 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      fundingRows: this.createProjectService.form2.value.fundingRows,
      fundingOverviewRows:
        this.createProjectService.form5.value.fundingOverviewRows,
    };
    if (this.createProjectService.form3.get('modality1')?.value !== '') {
      this.modalityOther =
        this.createProjectService.form3.get('modality1')?.value;
    }
    if (this.createProjectService.form3.get('areaOfExpertise1')?.value !== '') {
      this.areaOfExpertiseOther =
        this.createProjectService.form3.get('areaOfExpertise1')?.value;
    }
    // Copy values from this.form3 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      modality: this.createProjectService.form3.get('modality')?.value,
      modalityOther: this.modalityOther,
      areaOfExpertise:
        this.createProjectService.form3.get('areaOfExpertise')?.value,
      areaOfExpertiseOther: this.areaOfExpertiseOther,
      readiness: this.createProjectService.form3.get('readiness')?.value,
      projectBackground:
        this.createProjectService.form3.get('projectBackground')?.value,
      briefDescription:
        this.createProjectService.form3.get('briefDescription')?.value,
      outputRows: this.createProjectService.form2.value.outputRows,
    };
    this.dataSource = this.createProjectService.form2.value.outputRows;
    this.groupMember = this.createProjectService.form.value.groupMemberRows;
    this.collaboration =
      this.createProjectService.form1.value.collaborationRows;
    this.advisor = this.createProjectService.form1.value.externalAdvisorRows;
    this.subcontractor =
      this.createProjectService.form1.value.subContractorsRows;
    this.ppi = this.createProjectService.form1.value.ppiRows;
    this.funding = this.createProjectService.form2.value.fundingRows;
    this.fundingOverview =
      this.createProjectService.form5.value.fundingOverviewRows;
    this.otr = this.createProjectService.form4.value.otrRows;
    this.calculateSum();
    this.calculateSumOverview();
  }
  calculateSum() {
    this.sum = this.AddToProjectUpdate.fundingRows.reduce(
      (sum, row) => sum + row.value,
      0
    );
  }
  calculateSumOverview() {
    this.sumOverview = this.AddToProjectUpdate.fundingOverviewRows.reduce(
      (sumOverview, row) => sumOverview + row.valueOverview,
      0
    );
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
  storeData() {
    if (this.AddToProjectUpdate) {
      this.createProjectService
        .AddToProjectCreate(this.currentUser.email, this.AddToProjectUpdate)
        .subscribe(
          (response: any) => {
            if (response) {
              // Initialize an empty AddToProjectUpdate object
              const emptyAddToProjectUpdate: newProject = {
                projectName: '',
                lastNamePI: '',
                firstNamePI: '',
                emailPI: '',
                departmentPI: '',
                crsidPI: '',
                otherInforPI: '',
                groupMemberRows: [],
                ttoContractName: '',
                ttoContractEmail: '',
                ttoContractOtherInfo: '',
                subContractorsRows: [],
                modality: '',
                modalityOther: '',
                areaOfExpertise: '',
                areaOfExpertiseOther: '',
                readiness: '',
                projectBackground: '',
                briefDescription: '',
                outputRows: [],
                collaborationRows: [],
                externalAdvisorsRows: [],
                ppiRows: [],
                fundingRows: [],
                fundingOverviewRows: [],
                otrRows: [],
              };

              // Use emptyAddToProjectUpdate where needed
              this.AddToProjectUpdate = { ...emptyAddToProjectUpdate };
              this.notificationService.success(
                ':: Project is Updated successfully'
              );
            }
          },
          (error: HttpErrorResponse) => {
            alert(error.message);
            this.notificationService.error(error.message);
          }
        );
    } else {
      this.notificationService.error(':: Project is not Updated successfully');
    }
  }
  // Add dynamically new array of fields
  addFundingOverview() {
    this.createProjectService.fundingOverviewArr.push(
      this.createProjectService.initFundingOverviewRows()
    );
    this.cdr.detectChanges();
  }
  // Delete array of fields
  deleteFundingOverview(index: number) {
    this.createProjectService.fundingOverviewArr.removeAt(index);
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
      return '400px'; // Default height if no rows exist
    }

    const rowHeight = 50; // Row height in pixels
    const groupHeaderHeight = 30; // Height for group header rows
    const headerHeight = 60; // Header height (grid toolbar/header)
    const footerHeight = 40; // Footer height or other additional elements
    const otherElementsHeight = headerHeight + footerHeight;

    // Calculate the number of unique group headers
    const groupCount = this.fundingOverview.filter(
      (v, i, a) => a.findIndex((t) => t.aimsOverview === v.aimsOverview) === i
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

  calculateGridHeightAims2(rowCount: number | undefined): string {
    if (!rowCount || rowCount === 0) {
      return '400px'; // Default height if no rows exist
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
        var proposal = this.createProjectService.form.get('projectName')?.value;
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
  onClose() {
    this.dialogRef.close();
    window.location.reload();
  }
}
