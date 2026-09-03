/**
 * Service class for create project
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import {
  newProject,
  newProjectResponse,
  OutputRowsResponse,
  CollaborationRowsResponse,
  FundingRowsResponse,
  GroupMemberRowsResponse,
  SubContractorsRowsResponse,
  PPIRowsResponse,
  OTRRowsResponse,
  FundOverviewRowsResponse,
} from '../models/projectUpdate';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CreateProjectService {
  private apiServerUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  // Rest APi for getting Adding values for project create into database table
  public AddToProjectCreate(
    email: string,
    data: newProject
  ): Observable<newProject> {
    return this.http.post<newProject>(
      `${this.apiServerUrl}/projectCreate/addToProjectCreate/${email}`,
      data
    );
  }
  // Get Project create data
  public getCreateProjectData(): Observable<newProjectResponse[]> {
    return this.http.get<newProjectResponse[]>(
      `${this.apiServerUrl}/projectCreate/allData`
    );
  }
  // Get Project create data (Latest one)
  public getCreateProjectDataLatest(): Observable<newProjectResponse[]> {
    return this.http.get<newProjectResponse[]>(
      `${this.apiServerUrl}/projectCreate/allDatalatest`
    );
  }
  // Rest APi for deleting access permissions values
  public deletePermissions(id: number): Observable<newProject> {
    return this.http.delete<newProject>(
      `${this.apiServerUrl}/projectCreate/delete/${id}`
    );
  }
  // Rest APi for getting Project create values for histroy
  public getCreateProjectDataHistory(
    data: string
  ): Observable<newProjectResponse[]> {
    return this.http.get<newProjectResponse[]>(
      `${this.apiServerUrl}/projectCreate/allDataHistroy/${data}`
    );
  }
  public getGroupMemberById(id: number): Observable<GroupMemberRowsResponse[]> {
    return this.http.get<GroupMemberRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allGroupMember/${id}`
    );
  }
  // rest api for getting output data for create Project
  public getOutputById(id: number): Observable<OutputRowsResponse[]> {
    return this.http.get<OutputRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allOutput/${id}`
    );
  }
  // rest api for getting collaboration data for create Project
  public getCollaborationById(
    id: number
  ): Observable<CollaborationRowsResponse[]> {
    return this.http.get<CollaborationRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allCollaboration/${id}`
    );
  }
  // rest api for getting external advisor data for create Project
  public getExternalAdvisorById(
    id: number
  ): Observable<CollaborationRowsResponse[]> {
    return this.http.get<CollaborationRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allExternalAdvisor/${id}`
    );
  }
  // rest api for getting external advisor data for create Project
  public getppiById(id: number): Observable<PPIRowsResponse[]> {
    return this.http.get<PPIRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allPPI/${id}`
    );
  }
  // rest api for getting external advisor data for create Project
  public getotrById(id: number): Observable<OTRRowsResponse[]> {
    return this.http.get<OTRRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allOTR/${id}`
    );
  }
  // rest api for getting Subcontractor data for create Project
  public getsubcontractorById(
    id: number
  ): Observable<SubContractorsRowsResponse[]> {
    return this.http.get<SubContractorsRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allSubcontractor/${id}`
    );
  }
  // rest api for getting funding data for create Project
  public getFundingById(id: number): Observable<FundingRowsResponse[]> {
    return this.http.get<FundingRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allFunding/${id}`
    );
  }
  // rest api for getting funding data for create Project
  public getFundingOverviewById(
    id: number
  ): Observable<FundOverviewRowsResponse[]> {
    return this.http.get<FundOverviewRowsResponse[]>(
      `${this.apiServerUrl}/projectCreate/allFundingOverview/${id}`
    );
  }
  // Rest APi for update access permissions values ACcepted or rejected
  public updateProposalPerm(id: number, applyValue: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiServerUrl}/projectCreate/permUpdate/${id}/${applyValue}`,
      ''
    );
  }
  get formArr() {
    return this.form2.get('outputRows') as FormArray;
  }
  get f() {
    return this.form2.controls;
  }
  // Add dynamically new array of fields
  addNewOutput() {
    this.formArr.push(this.initOutputRows());
  }
  // Delete array of fields
  deleteOutput(index: number) {
    this.formArr.removeAt(index);
  }
  initOutputRows(): FormGroup {
    return new FormGroup({
      output: new FormControl('', Validators.required),
      confirmation: new FormControl(''),
      outputQuantity: new FormControl(''),
      output_description: new FormControl(''),
    });
  }
  initgroupMemberRows() {
    return new FormGroup({
      lastNamePostDoc: new FormControl(''),
      firstNamePostDoc: new FormControl(''),
      emailPostDoc: new FormControl(''),
      departmentPostDoc: new FormControl(''),
      positionPostDoc: new FormControl(''),
      crsidPostDoc: new FormControl(''),
      otherInforPostDoc: new FormControl(''),
    });
  }
  get groupMemberArr() {
    return this.form.get('groupMemberRows') as FormArray;
  }
  get groupMember1() {
    return this.form.controls;
  }
  initCollaborationRows(): FormGroup {
    return new FormGroup({
      collaboration: new FormControl('', Validators.required),
      collaborationName: new FormControl(''),
      collaborationEmail: new FormControl(''),
      collaborationLocation: new FormControl(''),
      collaborationOtherInfo: new FormControl(''),
    });
  }
  // Add dynamically new array of fields
  addgroupMember() {
    this.groupMemberArr.push(this.initgroupMemberRows());
  }
  // Delete array of fields
  deletegroupMember(index: number) {
    this.groupMemberArr.removeAt(index);
  }
  get collaborationArr() {
    return this.form1.get('collaborationRows') as FormArray;
  }
  get f1() {
    return this.form1.controls;
  }
  // Add dynamically new array of fields
  addNewCollaboration() {
    this.collaborationArr.push(this.initCollaborationRows());
  }
  // Delete array of fields
  deleteCollaboration(index: number) {
    this.collaborationArr.removeAt(index);
  }
  initExternalAdvisorRows(): FormGroup {
    return new FormGroup({
      externalAdvisorsMeeting: new FormControl(''),
      externalAdvisorsOrganisation: new FormControl(''),
      externalAdvisorsName: new FormControl(''),
      externalAdvisorsEmail: new FormControl(''),
      externalAdvisorsOutcome: new FormControl(''),
      externalAdvisorsExpertise: new FormControl(''),
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
  // add OTR logic

  initOtrRows(): FormGroup {
    return new FormGroup({
      otrTeamMember: new FormControl(''),
      otrRole: new FormControl(''),
      otrFunding: new FormControl(''),
      otrDate: new FormControl(''),
      otrOtherInfo: new FormControl(''),
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
  //add PPI logic

  initPPIRows(): FormGroup {
    return new FormGroup({
      ppiMeeting: new FormControl(''),
      ppiContact: new FormControl(''),
      ppiGroup: new FormControl(''),
      ppiOutcome: new FormControl(''),
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
    this.ppiArr.push(this.initExternalAdvisorRows());
  }
  // Delete array of fields
  deleteinitPPI(index: number) {
    this.ppiArr.removeAt(index);
  }
  // adding logic for subcontractor

  initSubContractorsRows() {
    return new FormGroup({
      subContractorsName: new FormControl(''),
      subContractorsEmail: new FormControl(''),
      subContractorsExpertise: new FormControl(''),
      subContractorsOrganisation: new FormControl(''),
      subContractorsOtherInfo: new FormControl(''),
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
  // Add funding overview array data
  initFundingOverviewRows() {
    return new FormGroup({
      fundingOverview: new FormControl(''),
      fundingOverviewOther: new FormControl(''),
      fundingOverviewNIHR: new FormControl(''),
      fundingOverviewNIHROther: new FormControl(''),
      fundingOverviewUKRIMRC: new FormControl(''),
      fundingOverviewUKRIMRCOther: new FormControl(''),
      fundingOverviewWellcomeTrust: new FormControl(''),
      fundingOverviewWellcomeTrustOther: new FormControl(''),
      schemeOverview: new FormControl(''),
      schemeOverviewOther: new FormControl(''),
      valueOverview: new FormControl(''),
      fundingOverviewStartDate: new FormControl(''),
      fundingOverviewEndDate: new FormControl(''),
      aimsOverview: new FormControl(''),
      grantNumberOverview: new FormControl(''),
      worktribeNumberOverview: new FormControl(''),
    });
  }
  get fundingOverviewArr() {
    return this.form5.get('fundingOverviewRows') as FormArray;
  }
  get fOverview() {
    return this.form5.controls;
  }

  // logic for funding rows
  initFundingRows() {
    return new FormGroup({
      funding: new FormControl(''),
      fundingOther: new FormControl(''),
      fundingNIHR: new FormControl(''),
      fundingNIHROther: new FormControl(''),
      fundingUKRIMRC: new FormControl(''),
      fundingUKRIMRCOther: new FormControl(''),
      fundingWellcomeTrust: new FormControl(''),
      fundingWellcomeTrustOther: new FormControl(''),
      scheme: new FormControl('', Validators.required),
      schemeOther: new FormControl(''),
      value: new FormControl('', Validators.required),
      fundingStartDate: new FormControl(''),
      fundingEndDate: new FormControl(''),
      aims: new FormControl('', Validators.required),
      grantNumber: new FormControl('', Validators.required),
      worktribeNumber: new FormControl(''),
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

  form: FormGroup = new FormGroup({
    $key: new FormControl(null),
    id: new FormControl(''),
    projectName: new FormControl(''),
    lastNamePI: new FormControl(''),
    firstNamePI: new FormControl(''),
    emailPI: new FormControl(''),
    departmentPI: new FormControl(''),
    crsidPI: new FormControl(''),
    otherInforPI: new FormControl(''),
    groupMemberRows: new FormArray([this.initgroupMemberRows()]),
    lastNamePostDoc: new FormControl(''),
    firstNamePostDoc: new FormControl(''),
    emailPostDoc: new FormControl(''),
    departmentPostDoc: new FormControl(''),
    positionPostDoc: new FormControl(''),
    crsidPostDoc: new FormControl(''),
    otherInforPostDoc: new FormControl(''),
    applyValue: new FormControl(''),
  });
  form1: FormGroup = new FormGroup({
    $key: new FormControl(null),
    id: new FormControl(''),
    collaborationRows: new FormArray([this.initCollaborationRows()]),
    externalAdvisorRows: new FormArray([this.initExternalAdvisorRows()]),
    ttoContractName: new FormControl(''),
    ttoContractEmail: new FormControl(''),
    ttoContractOtherInfo: new FormControl(''),
    subContractorsRows: new FormArray([this.initSubContractorsRows()]),
    ppiRows: new FormArray([this.initPPIRows()]),
  });
  form2: FormGroup = new FormGroup({
    outputRows: new FormArray([this.initOutputRows()]),
    fundingRows: new FormArray([this.initFundingRows()]),
  });
  form3: FormGroup = new FormGroup({
    modality: new FormControl(''),
    modality1: new FormControl(''),
    areaOfExpertise: new FormControl(''),
    areaOfExpertise1: new FormControl(''),
    readiness: new FormControl(''),
    projectBackground: new FormControl(''),
    briefDescription: new FormControl(''),
  });
  form4: FormGroup = new FormGroup({
    $key: new FormControl(null),
    otrRows: new FormArray([this.initOtrRows()]),
  });
  form5: FormGroup = new FormGroup({
    fundingOverviewRows: new FormArray([this.initFundingOverviewRows()]),
  });
  // Initialize the form values
  initializeFormGroup() {
    this.form.setValue({
      $key: null,
      id: '',
      projectName: '',
      lastNamePI: '',
      firstNamePI: '',
      emailPI: '',
      departmentPI: '',
      crsidPI: '',
      otherInforPI: '',
      lastNamePostDoc: '',
      firstNamePostDoc: '',
      emailPostDoc: '',
      departmentPostDoc: '',
      positionPostDoc: '',
      crsidPostDoc: '',
      otherInforPostDoc: '',
      applyValue: '',
    });
    this.form1.setValue({
      $key: null,
      collaborationRows: [this.initCollaborationRows()],
      externalAdvisorRows: [this.initExternalAdvisorRows()],
      ttoContractName: '',
      ttoContractEmail: '',
      ttoContractOtherInfo: '',
      subContractorsRows: [this.initSubContractorsRows()], //
      ppiRows: [this.initPPIRows()], //
    });
    this.form2.setValue({
      outputRows: [this.initOutputRows()],
      fundingRows: [this.initFundingRows()],
    });
    this.form3.setValue({
      modality: [[]],
      modality1: '',
      areaOfExpertise: [[]],
      areaOfExpertise1: '',
      readiness: '',
      projectBackground: '',
      briefDescription: '',
    });
    this.form4.setValue({
      otrRows: [this.initOtrRows()],
    });
    this.form5.setValue({
      fundingOverviewRows: [this.initFundingOverviewRows()],
    });
  }
  //Populate the form values
  populateForm(projectUpdate: newProjectResponse) {
    this.form.patchValue({
      $key: projectUpdate.id, // Assuming $key corresponds to the id property
      id: projectUpdate.id,
      projectName: projectUpdate.projectName,
      lastNamePI: projectUpdate.lastNamePI,
      firstNamePI: projectUpdate.firstNamePI,
      emailPI: projectUpdate.emailPI,
      departmentPI: projectUpdate.departmentPI,
      crsidPI: projectUpdate.crsidPI,
      otherInforPI: projectUpdate.otherInforPI,
      applyValue: projectUpdate.applyValue,
    });
    this.form1.patchValue({
      ttoContractName: projectUpdate.ttoContractName,
      ttoContractEmail: projectUpdate.ttoContractEmail,
      ttoContractOtherInfo: projectUpdate.ttoContractOtherInfo,
    });
    this.form3.patchValue({
      modality: projectUpdate.modality,
      modality1: projectUpdate.modalityOther,
      areaOfExpertise: projectUpdate.areaOfExpertise,
      areaOfExpertise1: projectUpdate.areaOfExpertiseOther,
      readiness: projectUpdate.readiness,
      projectBackground: projectUpdate.projectBackground,
      briefDescription: projectUpdate.briefDescription,
    });
  }
}
