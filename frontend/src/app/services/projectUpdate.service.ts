import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { projectUpdate, projectUpdateAdd } from '../models/projectUpdate';
@Injectable({
  providedIn: 'root'
})
export class ProjectUpdateService {
  private apiServerUrl = environment.apiBaseUrl;
constructor(private http: HttpClient) { }
  // Rest APi for getting Project Update values
  public getprojectUpdateData(): Observable<projectUpdate[]> {
    return this.http.get<projectUpdate[]>(`${this.apiServerUrl}/projectUpdate/allData`);
  }
    // Rest APi for getting Project Update values
    public getprojectUpdateDataHistroy(data:string): Observable<projectUpdate[]> {
      return this.http.get<projectUpdate[]>(`${this.apiServerUrl}/projectUpdate/allDataHistroy/${data}`);
    }
  // Rest APi for getting Project Update values
  public getProjectUpdateUserData(email:string ): Observable<projectUpdate[]> {
    return this.http.get<projectUpdate[]>(`${this.apiServerUrl}/projectUpdate/userData/${email}`);
  }
  // Rest APi for getting Adding values for project update into database table
  public AddToProjectUpdate(data: projectUpdateAdd): Observable<projectUpdateAdd> {
    return this.http.post<projectUpdateAdd>(
      `${this.apiServerUrl}/projectUpdate/addToProjectUpdate`,
      data
    );
  }
   // Rest APi for getting Adding values for project update into database table
   public modifyToProjectUpdate(data: projectUpdateAdd): Observable<projectUpdateAdd> {
    return this.http.post<projectUpdateAdd>(
      `${this.apiServerUrl}/projectUpdate/modifyToProjectUpdate`,
      data
    );
  }
    // Rest APi for deleting access permissions values
    public deletePermissions(id: number): Observable<projectUpdate> {
      return this.http.delete<projectUpdate>(
        `${this.apiServerUrl}/projectUpdate/delete/${id}`
      );
    }
  //Form for getting access permissions for working
  form: FormGroup = new FormGroup({
    $key: new FormControl(null),
    id: new FormControl(''),
      projectName: new FormControl(''),
      date: new FormControl(''),
      connections: new FormControl(''),
      connectionsType: new FormControl(''),
      application: new FormControl(''),
      funding: new FormControl(''),
      funding1: new FormControl(''),
      scheme: new FormControl(''),
      scheme1: new FormControl(''),
      collaborationPartners: new FormControl(''),
      collaborationPartnersDetails: new FormControl(''),
      tto: new FormControl(''),
      ttoDetails: new FormControl(''),
      scientificUpdate: new FormControl(''),
      grantOutcome: new FormControl(''),
      grantProjectName: new FormControl(''),
      grantProjectDuration: new FormControl(''),
      grantAwardValue: new FormControl(''),
      grantFunder: new FormControl(''),
      grantFunder1: new FormControl(''),
      grantScheme: new FormControl(''),
      grantScheme1: new FormControl(''),
      grantProjectMilestones: new FormControl(''),
      grantCollaborationPartners: new FormControl(''),
      grantCollaborationPartnersDetails: new FormControl(''),
      grantAdditionalFunding: new FormControl(''),
      grantAdditionalFundingDetails: new FormControl(''),
      grantMainTypeContributions:new FormControl(''),
      grantMainTypeContributions1: new FormControl(''),
      grantKnowledgeImpact: new FormControl(''),
      grantKnowledgeImpactDetails: new FormControl(''),
      createdEmail: new FormControl (''),
  });
  // Initialize the form values
  initializeFormGroup() {
    this.form.setValue({
      $key: null,
      id: '',
      projectName: '',
      date: '',
      connections: '',
      connectionsType: '',
      application: '',
      funding: '',
      funding1: '',
      scheme: '',
      scheme1: '',
      collaborationPartners: '',
      collaborationPartnersDetails: '',
      tto: '',
      ttoDetails: '',
      scientificUpdate: '',
      grantOutcome: '',
      grantProjectName: '',
      grantProjectDuration: '',
      grantAwardValue: '',
      grantFunder: '',
      grantFunder1: '',
      grantScheme: '',
      grantScheme1: '',
      grantProjectMilestones: '',
      grantCollaborationPartners: '',
      grantCollaborationPartnersDetails: '',
      grantAdditionalFunding: '',
      grantAdditionalFundingDetails: '',
      grantMainTypeContributions: '',
      grantMainTypeContributions1: '',
      grantKnowledgeImpact: '',
      grantKnowledgeImpactDetails: '',
      createdEmail:'',
    });
  }
     //Populate the form values
     populateForm(projectUpdate: projectUpdate) {
      this.form.patchValue({
        $key: projectUpdate.id,  // Assuming $key corresponds to the id property
        id: projectUpdate.id,
        projectName: projectUpdate.projectName,
        date: projectUpdate.date,
        connections: projectUpdate.connections,
        connectionsType: projectUpdate.connectionsType,
        application: projectUpdate.application,
        funding: projectUpdate.funding,
        funding1: projectUpdate.funding1,
        scheme: projectUpdate.scheme,
        scheme1: projectUpdate.scheme1,
        collaborationPartners: projectUpdate.collaborationPartners,
        collaborationPartnersDetails: projectUpdate.collaborationPartnersDetails,
        tto: projectUpdate.tto,
        ttoDetails: projectUpdate.ttoDetails,
        scientificUpdate: projectUpdate.scientificUpdate,
        grantOutcome: projectUpdate.grantOutcome,
        grantProjectName: projectUpdate.grantProjectName,
        grantProjectDuration: projectUpdate.grantProjectDuration,
        grantAwardValue: projectUpdate.grantAwardValue,
        grantFunder: projectUpdate.grantFunder,
        grantFunder1: projectUpdate.grantFunder1,
        grantScheme: projectUpdate.grantScheme,
        grantScheme1: projectUpdate.grantScheme1,
        grantProjectMilestones: projectUpdate.grantProjectMilestones,
        grantCollaborationPartners: projectUpdate.grantCollaborationPartners,
        grantCollaborationPartnersDetails: projectUpdate.grantCollaborationPartnersDetails,
        grantAdditionalFunding: projectUpdate.grantAdditionalFunding,
        grantAdditionalFundingDetails: projectUpdate.grantAdditionalFundingDetails,
        grantMainTypeContributions: projectUpdate.grantMainTypeContributions,
        grantMainTypeContributions1: projectUpdate.grantMainTypeContributions1,
        grantKnowledgeImpact: projectUpdate.grantKnowledgeImpact,
        grantKnowledgeImpactDetails: projectUpdate.grantKnowledgeImpactDetails,
        createdEmail: projectUpdate.createdEmail
      });
    }
}
