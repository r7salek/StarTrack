import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiServerUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}
  // Rest APi to get roles information
  public getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiServerUrl}/role/all`);
  }
}
