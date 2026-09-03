import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import html2canvas from 'html2canvas';
import jspdf, { jsPDF } from 'jspdf';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification.service';
import { newProject } from '../models/projectUpdate';
import { TokenStorageService } from '../core/login/_services/token-storage.service';
import { CreateProjectService } from '../services/CreateProject.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
@Component({
  selector: 'app-CreateProject',
  templateUrl: './CreateProject.component.html',
  styleUrls: ['./CreateProject.component.scss'],
})
export class CreateProjectComponent implements OnInit {
  /**
   * Main forms for the project creation process.
   * Each form corresponds to a specific section of the project data.
   */
  form: any = {}; // Main project information form
  form1: any = {}; // Collaboration, advisors, and subcontractors form
  form2: any = {}; // Outputs and funding details form
  form3: any = {}; // Project scope and description form
  form4: any = {}; // OTR (Output Tracking Rows) form
  form5: any = {}; // Funding overview form
  /**
   * Variables for controlling text field limits and UI elements.
   */
  maxChars = 150; // Maximum characters for some text fields
  maxChars1 = 65000; // Maximum characters for long text fields
  columnResizingMode!: string; // Grid column resizing mode
  dynamicRowHeight: string = '1:1'; // Default row height ratio
  dynamicRowHeight2: string = '1:1'; // Another dynamic row height setting
  /**
   * Variables for calculations and data handling.
   */
  sumOverview!: number; // Sum of funding overview values
  sum!: number; // Total funding amount
  /**
   * Arrays for storing form data dynamically.
   */
  subContractor: any[] = []; // Subcontractors data
  dataSource: any[] = []; // Output data
  collaboration: any[] = []; // Collaboration details
  groupMember: any[] = []; // Group members' information
  team: any[] = []; // team information
  scope: any[] = []; // scope information
  advisor: any[] = []; // team information
  ppi: any[] = []; // advisor information
  otr: any[] = []; // Output Tracking Rows (OTR)
  funding: any[] = []; // Funding rows
  fundingOverview: any[] = []; // Funding overview rows
  /**
   * UI-related variables and selected options for dropdowns.
   */
  nameEditorOptions: Object; // Options for name editor
  selectedModality!: string[]; // Selected modalities
  numbers!: number[];

  currentUser: any; // variable for current user
  modalityOther!: string; // Additional modality information
  otherInforPI!: string; // Additional information about the principal investigator
  otherInforPostDoc!: string;
  areaOfExpertiseOther!: string; // Additional area of expertise information
  ttoContractOtherInfo!: string; // Additional information about the TTO contract
  subContractorsOtherInfo!: string; // Additional subcontractor information
  fundingOther!: string; // Additional funding details
  fundingNIHR!: string; // Additional NIHR funding details
  fundingNIHROther!: string; // Other details for NIHR funding
  fundingUKRIMRC!: string; // Additional UKRI-MRC funding details
  fundingUKRIMRCOther!: string; // Other details for UKRI-MRC funding
  WellcomeTrustOther!: string; // Additional Wellcome Trust funding details
  fundingWellcomeTrust!: string; // Wellcome Trust funding information
  /**
   * Variables for funding overview additional information.
   */
  fundingOverviewOther!: string; // Additional funding overview details
  fundingOverviewNIHR!: string; // NIHR funding overview details
  fundingOverviewNIHROther!: string; // Other details for NIHR funding overview
  fundingOverviewUKRIMRC!: string; // UKRI-MRC funding overview details
  fundingOverviewUKRIMRCOther!: string; // Other details for UKRI-MRC funding overview
  WellcomeTrustOverviewOther!: string; // Additional Wellcome Trust funding overview details
  fundingWellcomeOverviewTrust!: string; // Wellcome Trust funding overview

  collaborationOtherInfo!: string;
  selectedareaOfExpertise!: string[];
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

  /**
   * UI settings for data grids and dynamic heights.
   */
  gridHeight: number = 0;
  gridHeight1: number = 0;

  @ViewChild('formContainer', { static: false })
  formContainer!: ElementRef;
  isFormReadOnly = true;
  selectedscheme: string[] = [];
  AddToProjectUpdate: newProject = {} as newProject;
  /**
   * Constants for dropdown values in forms.
   */
  public outputValue = [
    'Academic journal publications',
    'Other Publications',
    'Number of Policy impacts',
    'Patent(s) filed',
    'Patent(s) granted',
    'Licence(s)',
    'Spinout (registered?)',
    'Number of protypes / pilots developed',
    'Number of new products, processes or techniques developed',
    'Number of events to encourage or facilitate knowledge exchange and impact',
    'Number of specific public engagement activities',
    'Other (please specify)',
  ];
  public collaborationValue = ['Academic', 'Industry', 'NHS', 'Other', 'None'];
  public confirmationValue = ['YES', 'NO'];
  public positionValue = ['PHD', 'POSTDOC'];
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
  maxChars3!: 65000;
  /**
   * Constructor to inject necessary services and dependencies.
   */
  constructor(
    private fb: FormBuilder, // Service to create reactive forms
    private cdr: ChangeDetectorRef, // Service to manually trigger change detection
    public notificationService: NotificationService, // Service for notifications and alerts
    private tokenStorageService: TokenStorageService, // Service for managing user token and session
    public createProjectService: CreateProjectService, // Service to handle project creation API calls
    private dateAdapter: DateAdapter<Date>, // Adapter for customizing date formats
    private _router: Router // Service for routing and navigation
  ) {
    // Setting the locale for date format
    dateAdapter.setLocale('en-de'); // DD/MM/YYYY
    this.currentUser = this.tokenStorageService.getUser(); // Retrieve the current logged-in user's details
    this.nameEditorOptions = { disabled: true }; // Disable name editor by default
  }
  /**
   * Lifecycle hook - initializes forms and default settings when the component is created.
   */
  ngOnInit() {
    // Define the main project form with fields for members details
    this.form = this.fb.group({
      projectName: '', // Project name
      lastNamePI: '', // PI last name
      firstNamePI: '', // PI first name
      emailPI: '', // PI email
      departmentPI: '', // PI department
      crsidPI: '', // Cambridge Research System ID
      otherInforPI: '', // Additional information about the PI
      groupMemberRows: this.fb.array([this.initgroupMemberRows()]), // Array for group member details
    });
    // Define the collaboration and advisor details form
    this.form1 = this.fb.group({
      collaborationRows: this.fb.array([this.initCollaborationRows()]), // Collaboration details
      externalAdvisorRows: this.fb.array([this.initExternalAdvisorRows()]), // External advisors
      ttoContractName: '', // TTO contact name
      ttoContractEmail: '', // TTO contact email
      ttoContractOtherInfo: '', // Additional TTO information
      subContractorsRows: this.fb.array([this.initSubContractorsRows()]), // Subcontractor details
      ppiRows: this.fb.array([this.initPPIRows()]), // Public and Patient Involvement rows
    });
    // Define the outputs and funding form
    this.form2 = this.fb.group({
      outputRows: this.fb.array([]), // Outputs array
      fundingRows: this.fb.array([this.initFundingRows()]), // Funding details array
    });
    this.populateOutputRows(); // Populate the outputs form with default values
    // Define the project scope form
    this.form3 = this.fb.group({
      modality: '', // Project modality
      modality1: '', // Additional modality information
      areaOfExpertise: '', // Area of expertise
      areaOfExpertise1: '', // Additional area of expertise information
      readiness: '', // Project readiness level
      projectBackground: '', // Background of the project
      briefDescription: '', // Brief description of the project
    });
    // Define the OTR form
    this.form4 = this.fb.group({
      otrRows: this.fb.array([this.initOtrRows()]), // Output Tracking Rows (OTR)
    });
    // Define the funding overview form
    this.form5 = this.fb.group({
      fundingOverviewRows: this.fb.array([this.initFundingOverviewRows()]), // Funding overview rows
    });
    // Trigger a manual change detection to ensure all form data is reflected in the UI
    this.cdr.detectChanges();
  }
  /**
   * Populate the outputRows FormArray with default values from outputValue.
   */
  populateOutputRows() {
    const outputArray = this.form2.get('outputRows') as FormArray; // Access the FormArray
    this.outputValue.forEach((output, index) => {
      // For each output value, add a form group with default values
      outputArray.push(this.initOutputRowsWithDefault(output));
    });
  }

  /**
   * Initialize an output row with default values.
   * @param output - The default value for the output field.
   * @returns A FormGroup with default values for the output row.
   */
  initOutputRowsWithDefault(output: string) {
    return this.fb.group({
      output: [output, Validators.required], // Pre-fill the output field with the given value
      confirmation: '', // Confirmation field
      outputQuantity: '', // Quantity for the output
      output_description: '', // Description of the output
    });
  }
  /**
   * Initializes a blank output row.
   * @returns A FormGroup with empty values for all output fields.
   */
  initOutputRows() {
    return this.fb.group({
      output: [[], Validators.required], // Output field
      confirmation: '', // Confirmation field
      outputQuantity: '', // Quantity for the output
      output_description: '', // Description of the output
    });
  }
  /**
   * Getter for accessing the outputRows FormArray.
   */
  get formArr() {
    return this.form2.get('outputRows') as FormArray;
  }
  /**
   * Getter for accessing the controls of form2.
   */
  get f() {
    return this.form2.controls;
  }
  /**
   * Initializes a new group member row.
   * @returns A FormGroup with fields for group member details.
   */
  initgroupMemberRows() {
    return this.fb.group({
      lastNamePostDoc: '', // Postdoc last name
      firstNamePostDoc: '', // Postdoc first name
      emailPostDoc: '', // Postdoc email
      departmentPostDoc: '', // Postdoc department
      positionPostDoc: '', // Postdoc position
      crsidPostDoc: '', // Postdoc Cambridge Research System ID
      otherInforPostDoc: '', // Additional information about the postdoc
    });
  }
  /**
   * Getter for accessing the groupMemberRows FormArray.
   */
  get groupMemberArr() {
    return this.form.get('groupMemberRows') as FormArray;
  }
  get groupMember1() {
    return this.form.controls;
  }
  /**
   * Add a new group member row dynamically.
   */
  addgroupMember() {
    this.groupMemberArr.push(this.initgroupMemberRows());
  }
  /**
   * Delete a group member row based on its index.
   * @param index - The index of the group member row to remove.
   */
  deletegroupMember(index: number) {
    this.groupMemberArr.removeAt(index);
  }
  /**
   * Initializes a new collaboration row.
   * @returns A FormGroup with fields for contractor details.
   */
  initSubContractorsRows() {
    return this.fb.group({
      subContractorsName: '', // Name of the contractor
      subContractorsEmail: '', // Email of the contractor
      subContractorsExpertise: '',
      subContractorsOrganisation: '',
      subContractorsOtherInfo: '',
    });
  }
  get subContractorsRowsArr() {
    return this.form1.get('subContractorsRows') as FormArray;
  }
  get fsubcontractors() {
    return this.form1.controls;
  }
  // Add dynamically new array of fields
  addNewSubContractors() {
    this.subContractorsRowsArr.push(this.initSubContractorsRows());
  }
  // Delete array of fields
  deleteSubContractors(index: number) {
    this.subContractorsRowsArr.removeAt(index);
  }
  /**
   * Initializes a new collaboration row.
   * @returns A FormGroup with fields for collaboration details.
   */
  initCollaborationRows() {
    return this.fb.group({
      collaboration: [[], Validators.required], // Type of collaboration
      collaborationName: '', // Name of the collaborator
      collaborationEmail: '', // Email of the collaborator
      collaborationLocation: '', // Location of the collaboration
      collaborationOtherInfo: '', // Additional information about the collaboration
    });
  }
  /**
   * Getter for accessing the collaborationRows FormArray.
   */
  get collaborationArr() {
    return this.form1.get('collaborationRows') as FormArray;
  }
  get f1() {
    return this.form1.controls;
  }
  /**
   * Add a new collaboration row dynamically.
   */
  addNewCollaboration() {
    this.collaborationArr.push(this.initCollaborationRows());
  }
  /**
   * Delete a collaboration row based on its index.
   * @param index - The index of the collaboration row to remove.
   */
  deleteCollaboration(index: number) {
    this.collaborationArr.removeAt(index);
  }
  // logic for PPIROWS

  initPPIRows() {
    return this.fb.group({
      ppiMeeting: '',
      ppiContact: '',
      ppiGroup: '',
      ppiOutcome: '',
    });
  }
  get ppiArr() {
    return this.form1.get('ppiRows') as FormArray;
  }
  get f4() {
    return this.form1.controls;
  }
  // Add dynamically new array of fields
  addinitPPI() {
    this.ppiArr.push(this.initPPIRows());
  }
  // Delete array of fields
  deleteinitPPI(index: number) {
    this.ppiArr.removeAt(index);
  }
  //logic for OTR rows

  initOtrRows() {
    return this.fb.group({
      otrTeamMember: '',
      otrRole: '',
      otrFunding: '',
      otrDate: '',
      otrOtherInfo: '',
    });
  }
  get otrArr() {
    return this.form4.get('otrRows') as FormArray;
  }
  get f5() {
    return this.form4.controls;
  }
  // Add dynamically new array of fields
  addOTR() {
    this.otrArr.push(this.initOtrRows());
  }
  // Delete array of fields
  deleteOTR(index: number) {
    this.otrArr.removeAt(index);
  }

  // Logic for initExternalAdvisorRows

  initExternalAdvisorRows() {
    return this.fb.group({
      externalAdvisorsMeeting: '',
      externalAdvisorsOrganisation: '',
      externalAdvisorsName: '',
      externalAdvisorsEmail: '',
      externalAdvisorsOutcome: '',
      externalAdvisorsExpertise: '',
    });
  }
  get externalAdvisorArr() {
    return this.form1.get('externalAdvisorRows') as FormArray;
  }
  get f2() {
    return this.form1.controls;
  }
  // Add dynamically new array of fields
  addExternalAdvisor() {
    this.externalAdvisorArr.push(this.initExternalAdvisorRows());
  }
  // Delete array of fields
  deleteExternalAdvisor(index: number) {
    this.externalAdvisorArr.removeAt(index);
  }
  //Logic for initFundingOverviewRows

  initFundingOverviewRows() {
    return this.fb.group({
      fundingOverview: '',
      fundingOverviewOther: '',
      fundingOverviewNIHR: '',
      fundingOverviewNIHROther: '',
      fundingOverviewUKRIMRC: '',
      fundingOverviewUKRIMRCOther: '',
      fundingOverviewWellcomeTrust: '',
      fundingOverviewWellcomeTrustOther: '',
      schemeOverview: '',
      schemeOverviewOther: '',
      valueOverview: '',
      fundingOverviewStartDate: '',
      fundingOverviewEndDate: '',
      grantNumberOverview: '',
      worktribeNumberOverview: '',
      aimsOverview: '',
    });
  }
  get fundingOverviewArr() {
    return this.form5.get('fundingOverviewRows') as FormArray;
  }
  get fOverview() {
    return this.form5.controls;
  }
  // Add dynamically new array of fields
  addFundingOverview() {
    this.fundingOverviewArr.push(this.initFundingOverviewRows());
    this.cdr.detectChanges();
  }
  // Delete array of fields
  deleteFundingOverview(index: number) {
    this.fundingOverviewArr.removeAt(index);
  }

  // logic for funding rows
  initFundingRows() {
    return this.fb.group({
      funding: '',
      fundingOther: '',
      fundingNIHR: '',
      fundingNIHROther: '',
      fundingUKRIMRC: '',
      fundingUKRIMRCOther: '',
      fundingWellcomeTrust: '',
      fundingWellcomeTrustOther: '',
      scheme: '',
      schemeOther: '',
      value: '',
      fundingStartDate: '',
      fundingEndDate: '',
      aims: '',
      grantNumber: '',
      worktribeNumber: '',
    });
  }
  get fundingArr() {
    return this.form2.get('fundingRows') as FormArray;
  }
  get f3() {
    return this.form2.controls;
  }
  // Add dynamically new array of fields
  addFunding() {
    this.fundingArr.push(this.initFundingRows());
  }
  // Delete array of fields
  deleteFunding(index: number) {
    this.fundingArr.removeAt(index);
  }

  onSelectModality(value: any[]) {
    if (value && !value.includes('Other (please specify)')) {
      this.form3.get('modality1').reset();
    }
  }
  onSelectAreaOfExpertise(value: any) {
    if (value !== 'Other (please specify)') {
      this.form3.get('areaOfExpertise1').reset();
    }
  }
  onSelectFundingschemeFunder(index: number, value: any) {
    const formGroup = this.form2.get('fundingRows').at(index) as FormGroup;
    const schemeOtherControl = formGroup.get('schemeOther');
    if (value && !value.includes('Other (please specify)')) {
      schemeOtherControl?.reset();
    }
  }

  onSelectFundingOverviewschemeFunder(index: number, value: any) {
    const formGroup = this.form5
      .get('fundingOverviewRows')
      .at(index) as FormGroup;
    const schemeOtherControl = formGroup.get('schemeOverviewOther');
    if (value && !value.includes('Other (please specify)')) {
      schemeOtherControl?.reset();
    }
  }
  onSelectFundingGrantsFunder(index: number, value: any[]) {
    const formGroup = this.form2.get('fundingRows').at(index) as FormGroup;

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
  // funding overview
  onSelectFundingGrantsFunderOverview(index: number, value: any[]) {
    const formGroup = this.form5
      .get('fundingOverviewRows')
      .at(index) as FormGroup;

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
  onSelectFundingGrantsFunderNIHR(index: number, value: any) {
    const formGroup = this.form2.get('fundingRows').at(index) as FormGroup;
    const fundingNIHROtherControl = formGroup.get('fundingNIHROther');
    if (
      fundingNIHROtherControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingNIHROtherControl.reset();
    }
  }
  // funding overview
  onSelectFundingGrantsFunderOverviewNIHR(index: number, value: any) {
    const formGroup = this.form5
      .get('fundingOverviewRows')
      .at(index) as FormGroup;
    const fundingNIHROtherControl = formGroup.get('fundingOverviewNIHROther');
    if (
      fundingNIHROtherControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingNIHROtherControl.reset();
    }
  }

  onSelectFundingGrantsFunderUKRIMRC(index: number, value: any) {
    const formGroup = this.form2.get('fundingRows').at(index) as FormGroup;
    const fundingUKRIMRCOtherControl = formGroup.get('fundingUKRIMRCOther');
    if (
      fundingUKRIMRCOtherControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingUKRIMRCOtherControl.reset();
    }
  }
  // funding overview
  onSelectFundingGrantsFunderOverviewUKRIMRC(index: number, value: any) {
    const formGroup = this.form5
      .get('fundingOverviewRows')
      .at(index) as FormGroup;
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
  }
  onSelectFundingGrantsFunderWellcomeTrust(index: number, value: any) {
    const formGroup = this.form2.get('fundingRows').at(index) as FormGroup;
    const fundingWellcomeTrustControl = formGroup.get('fundingWellcomeTrust');
    if (
      fundingWellcomeTrustControl &&
      value &&
      !value.includes('Other (please specify)')
    ) {
      fundingWellcomeTrustControl.reset();
    }
  }
  // funding overview
  onSelectFundingGrantsOverviewFunderWellcomeTrust(index: number, value: any) {
    const formGroup = this.form5
      .get('fundingOverviewRows')
      .at(index) as FormGroup;
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
  }
  onSelectFundingGrantsScheme(value: any) {
    if (value && !value.includes('Other (please specify)')) {
      this.form.get('scheme1').reset();
    }
  }

  onSelectFundingOverviewGrantsScheme(value: any) {
    if (value && !value.includes('Other (please specify)')) {
      this.form5.get('scheme1').reset();
    }
  }
  /**
   * Combine data from all forms into a single object for submission.
   */
  combineData() {
    if (this.form.get('otherInforPI').value !== '') {
      this.otherInforPI = this.form.get('otherInforPI').value;
    }
    // Merge data from form fields into AddToProjectUpdate object
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      projectName: this.form.get('projectName').value,
      lastNamePI: this.form.get('lastNamePI').value,
      firstNamePI: this.form.get('firstNamePI').value,
      emailPI: this.form.get('emailPI').value,
      departmentPI: this.form.get('departmentPI').value,
      crsidPI: this.form.get('crsidPI').value,
      otherInforPI: this.otherInforPI,
      groupMemberRows: this.form.value.groupMemberRows,
    };
    // this.AddToProjectUpdate = defaultNewProject;
    if (this.form1.get('ttoContractOtherInfo').value !== '') {
      this.ttoContractOtherInfo = this.form1.get('ttoContractOtherInfo').value;
    }
    // Copy values from this.form1 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      collaborationRows: this.form1.value.collaborationRows,
      externalAdvisorsRows: this.form1.value.externalAdvisorRows,
      ttoContractName: this.form1.get('ttoContractName').value,
      ttoContractEmail: this.form1.get('ttoContractEmail').value,
      ttoContractOtherInfo: this.ttoContractOtherInfo,
      subContractorsRows: this.form1.value.subContractorsRows,
      ppiRows: this.form1.value.ppiRows,
    };

    // Copy values from this.form2 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      fundingRows: this.form2.value.fundingRows,
      fundingOverviewRows: this.form5.value.fundingOverviewRows,
    };
    if (this.form3.get('modality1').value !== '') {
      this.modalityOther = this.form3.get('modality1').value;
    }
    if (this.form3.get('areaOfExpertise1').value !== '') {
      this.areaOfExpertiseOther = this.form3.get('areaOfExpertise1').value;
    }
    // Copy values from this.form3 to AddToProjectUpdate
    this.AddToProjectUpdate = {
      ...this.AddToProjectUpdate,
      modality: this.form3.get('modality').value,
      modalityOther: this.modalityOther,
      areaOfExpertise: this.form3.get('areaOfExpertise').value,
      areaOfExpertiseOther: this.areaOfExpertiseOther,
      readiness: this.form3.get('readiness').value,
      projectBackground: this.form3.get('projectBackground').value,
      briefDescription: this.form3.get('briefDescription').value,
      outputRows: this.form2.value.outputRows,
      otrRows: this.form4.value.otrRows,
    };
    this.dataSource = this.form2.value.outputRows;
    this.groupMember = this.form.value.groupMemberRows;
    this.collaboration = this.form1.value.collaborationRows;
    this.advisor = this.form1.value.externalAdvisorRows;
    this.subContractor = this.form1.value.subContractorsRows;
    this.funding = this.form2.value.fundingRows;
    this.fundingOverview = this.form5.value.fundingOverviewRows;
    this.ppi = this.form1.value.ppiRows;
    this.otr = this.form4.value.otrRows;
    this.calculateSum();
    this.cdr.detectChanges();
  }
  calculateSum() {
    this.sum = this.AddToProjectUpdate.fundingRows.reduce(
      (sum, row) => sum + row.value,
      0
    );
    // Calculate total funding overview value
    this.sumOverview = this.AddToProjectUpdate.fundingOverviewRows.reduce(
      (sumOverview: any, row: { valueOverview: any }) =>
        sumOverview + row.valueOverview,
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

  //Funding overview visible logic

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
  /**
   * Submit the project data to the server via CreateProjectService.
   */
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
                ':: Project is Submitted successfully'
              );
              // window.location.reload();
            }
          },
          (error: HttpErrorResponse) => {
            alert(error.message);
            this.notificationService.error(error.message);
          }
        );
    } else {
      this.notificationService.error(
        ':: Project is not Submitted successfully'
      );
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
        var proposal = this.form.get('projectName').value;
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
    window.location.reload();
  }
}
