import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

describe('UserService HTTP contracts', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deletes a user with DELETE', () => {
    service.deleteUser('user@startrack.test').subscribe();
    const request = http.expectOne(
      `${environment.apiBaseUrl}/sybeUser/delete/user@startrack.test`
    );
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('activates a user with PUT', () => {
    service.activateUser('user@startrack.test').subscribe();
    const request = http.expectOne(
      `${environment.apiBaseUrl}/sybeUser/activate/user@startrack.test`
    );
    expect(request.request.method).toBe('PUT');
    request.flush({});
  });

  it('updates roles with PUT', () => {
    service.updateUserRole('user@startrack.test', ['ROLE_USER']).subscribe();
    const request = http.expectOne(
      `${environment.apiBaseUrl}/sybeUser/roleUpdate/user@startrack.test/ROLE_USER`
    );
    expect(request.request.method).toBe('PUT');
    request.flush({});
  });

  it('updates the current profile with POST', () => {
    const profile = { id: 1, firstName: 'Synthetic' } as any;
    service.updateUserProfile(1, profile).subscribe();
    const request = http.expectOne(
      `${environment.apiBaseUrl}/sybeUser/profileUpdate/1`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(profile);
    request.flush(profile);
  });

  it('updates the current password with POST', () => {
    const password = { password: 'synthetic-password' };
    service.updateUserPassword(1, password).subscribe();
    const request = http.expectOne(
      `${environment.apiBaseUrl}/sybeUser/passwordUpdate/1`
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(password);
    request.flush(password);
  });
});
