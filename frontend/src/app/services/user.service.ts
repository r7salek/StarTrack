import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { User, UserData,UserPassword } from '../models/user';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiServerUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}
    // Rest API for fetching current user information
    public getCurrentUser(id: number): Observable<UserData[]> {
      return this.http.get<UserData[]>(`${this.apiServerUrl}/sybeUser/${id}`);
    }
    // Rest API for update user profile
    public updateUserPassword(
      id: number,
      UserPassword: UserPassword
    ): Observable<UserPassword> {
      return this.http.post<UserPassword>(
        `${this.apiServerUrl}/sybeUser/passwordUpdate/${id}`,
        UserPassword
      );
    }
    public updateUserProfile(
      id: number,
      userData: UserData
    ): Observable<UserData> {
      return this.http.post<UserData>(
        `${this.apiServerUrl}/sybeUser/profileUpdate/${id}`,
        userData
      );
    }
      // Rest API for deleting specific user
  public deleteUser(email: string): Observable<UserData> {
    return this.http.delete<UserData>(
      `${this.apiServerUrl}/sybeUser/delete/${email}`
    );
  }
  //  for checking user is activate
  public activateUser(email: string): Observable<UserData> {
    return this.http.put<UserData>(
      `${this.apiServerUrl}/sybeUser/activate/${email}`,
      ''
    );
  }
  //  for resetPassword user
  public resetPassword(email: string): Observable<UserData> {
    return this.http.put<UserData>(
      `${this.apiServerUrl}/sybeUser/resetPassword/${email}`,
      ''
    );
  }
    // Update user roles
    public updateUserRole(email: string, role: string[]): Observable<UserData> {
      return this.http.put<UserData>(
        `${this.apiServerUrl}/sybeUser/roleUpdate/${email}/${role}`,
        ''
      );
    }
  // Rest APi for getting approved users values
  public getUserApprovalData(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiServerUrl}/sybeUser/userData`);
  }
    // Rest API for getting user data with roles
    public getUserData(): Observable<UserData[]> {
      return this.http.get<UserData[]>(`${this.apiServerUrl}/sybeUser/userData`);
    }
  form: FormGroup = new FormGroup({
    $key: new FormControl(null),
    id: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    role: new FormControl(''),
    password: new FormControl(''),
  });
  // initializing the form
  initializeFormGroup() {
    this.form.setValue({
      $key: null,
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      role: [[]],
      password: '',
    });
  }
  // Populating the form
  populateForm(UserData: UserData[]) {
    this.form.patchValue(UserData);
  }

}
