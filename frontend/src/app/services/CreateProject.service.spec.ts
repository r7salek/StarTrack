import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CreateProjectService } from './CreateProject.service';
import { AppConstants } from '../core/login/common/app.constants';

describe('Project identity HTTP contracts', () => {
  let service: CreateProjectService;
  let http: HttpTestingController;
  const root = '01234567-89ab-4cde-8fab-0123456789ab';
  const url = `${environment.apiBaseUrl}/api/projects`;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CreateProjectService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('keeps development API requests on the browser origin', () => {
    expect(environment.apiBaseUrl).toBe('');
    expect(AppConstants.AUTH_API).toBe('/api/auth/');
    service.getCreateProjectDataLatest().subscribe();
    const req = http.expectOne('/api/projects');
    expect(req.request.url.startsWith('http')).toBeFalse();
    req.flush([]);
  });

  it('creates a project without using an email as identity', () => {
    const data = { projectName: 'Same name' } as any;
    service.createProject(data).subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(data);
    req.flush({ projectId: root, versionNumber: 1 }, { status: 201, statusText: 'Created' });
  });
  it('lists active projects through the stable API', () => {
    service.getCreateProjectDataLatest().subscribe();
    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
  it('addresses history by UUID, independent of the project name', () => {
    service.getCreateProjectDataHistory(root).subscribe();
    const req = http.expectOne(`${url}/${root}/versions`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
  it('appends with the expected version without mutating the supplied form', () => {
    const data = { projectName: 'Renamed', expectedVersion: 99 } as any;
    service.appendProjectVersion(root, 2, data).subscribe();
    const req = http.expectOne(`${url}/${root}/versions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.expectedVersion).toBe(2);
    expect(data.expectedVersion).toBe(99);
    req.flush({ projectId: root, versionNumber: 3 }, { status: 201, statusText: 'Created' });
  });
  it('archives the whole project with DELETE and an empty response', () => {
    service.archiveProject(root).subscribe();
    const req = http.expectOne(`${url}/${root}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
  it('retains numeric version IDs for nested-record reads', () => {
    service.getGroupMemberById(42).subscribe();
    const req = http.expectOne(`${environment.apiBaseUrl}/projectCreate/allGroupMember/42`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
