 /**Service defining the Auth data for Sign up and login */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConstants } from '../common/app.constants';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  //Logic for Login user
  login(credentials: { username: any; password: any }): Observable<any> {
    return this.http.post(
      AppConstants.AUTH_API + 'signin',
      {
        email: credentials.username,
        password: credentials.password,
      },
      httpOptions
    );
  }
  //Logic for user registrations
  register(user: {
    firstName: any;
    lastName: any;
    email: any;
    password: any;
    matchingPassword: any;
  }): Observable<any> {
    return this.http.post(
      AppConstants.AUTH_API + 'signup',
      {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        matchingPassword: user.matchingPassword,
        socialProvider: 'LOCAL',
      },
      httpOptions
    );
  }
}
