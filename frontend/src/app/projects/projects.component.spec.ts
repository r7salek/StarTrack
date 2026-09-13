import { of, Subject, throwError } from 'rxjs';
import { ProjectsComponent } from './projects.component';
import { latestActiveProjects, piName, searchProjects, sortProjects, statusKey, statusLabel } from './project-overview';
import { newProjectResponse } from '../models/projectUpdate';
import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from '../Shared/Shared.module';
import { CreateProjectService } from '../services/CreateProject.service';
import { TokenStorageService } from '../core/login/_services/token-storage.service';
import { NotificationService } from '../services/notification.service';
import { MatDialog } from '@angular/material/dialog';

const project = (id: string, status = 'SUBMITTED', extra = {}) => ({
  projectId: id, id: 1, versionId: 1, versionNumber: 1, archived: false,
  projectName: `Project ${id}`, firstNamePI: 'Test', lastNamePI: 'Researcher',
  departmentPI: 'Medicine', applyValue: status, modality: '', areaOfExpertise: '', ...extra,
} as newProjectResponse);

describe('Project overview data', () => {
  it('counts the latest version once and excludes roots whose latest version is archived', () => {
    const rows = [project('a'), project('a', 'ACCEPTED', { versionNumber: 2 }), project('b'),
      project('b', 'CLOSED', { versionNumber: 3, archived: true })];
    const before = JSON.stringify(rows);
    expect(latestActiveProjects(rows).map(row => row.applyValue)).toEqual(['ACCEPTED']);
    expect(JSON.stringify(rows)).toBe(before);
  });
  it('keeps distinct UUIDs even when project names match', () => {
    expect(latestActiveProjects([project('a', '', { projectName: 'Same' }), project('b', '', { projectName: 'Same' })]).length).toBe(2);
  });
  it('handles missing and unrecognised statuses without dropping projects', () => {
    expect(statusKey(project('a', ' '))).toBe('NOT_RECORDED');
    expect(statusKey(project('b', 'CUSTOM'))).toBe('OTHER');
    expect(statusLabel(project('b', 'CUSTOM'))).toBe('Other: CUSTOM');
    expect(statusKey(project('c', 'accepted'))).toBe('ACCEPTED');
  });
  it('searches names, PI names and departments case-insensitively', () => {
    const rows = [project('a'), project('b', '', { firstNamePI: 'Alice', lastNamePI: 'Example', departmentPI: 'Surgery' })];
    expect(searchProjects(rows, '  SURGERY ').map(row => row.projectId)).toEqual(['b']);
    expect(searchProjects(rows, 'alice example').map(row => row.projectId)).toEqual(['b']);
    expect(searchProjects(rows, 'project a').map(row => row.projectId)).toEqual(['a']);
    expect(piName(project('c', '', { firstNamePI: null, lastNamePI: null }))).toBe('');
  });
  it('sorts a copy rather than mutating the source', () => {
    const rows = [project('b'), project('a')];
    expect(sortProjects(rows, 'projectName', true).map(row => row.projectId)).toEqual(['a', 'b']);
    expect(rows.map(row => row.projectId)).toEqual(['b', 'a']);
  });
});

describe('ProjectsComponent', () => {
  function setup(admin = false, response: any = of([])) {
    const service = jasmine.createSpyObj('CreateProjectService', ['getCreateProjectDataLatest', 'getCreateProjectData', 'populateForm', 'archiveProject']);
    service.getCreateProjectDataLatest.and.returnValue(response);
    service.archiveProject.and.returnValue(of(undefined));
    const storage = { getToken: () => 'synthetic-token', getUser: () => ({ roles: [admin ? 'ROLE_ADMIN' : 'ROLE_USER'] }) };
    const dialog = { open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => new Subject(), close: jasmine.createSpy('close') }) };
    const notifications = jasmine.createSpyObj('NotificationService', ['confirmation', 'error', 'success']);
    const router = { url: '/projects', navigate: jasmine.createSpy('navigate') };
    return { component: new ProjectsComponent(service, storage as any, dialog as any, notifications, router as any), service, storage, dialog, notifications, router };
  }
  it('keeps loading distinct from an empty response and cancels pending reads on destroy', () => {
    const pending = new Subject<newProjectResponse[]>();
    const { component } = setup(false, pending);
    component.ngOnInit();
    expect(component.loading).toBeTrue();
    expect(component.counts).toEqual([]);
    component.ngOnDestroy();
    expect(pending.observed).toBeFalse();
  });
  it('offers retry after request failure rather than showing an empty chart', () => {
    const { component, service } = setup(false, throwError(() => ({ status: 500 })));
    component.load();
    expect(component.error).toContain('could not be loaded');
    expect(component.loading).toBeFalse();
    service.getCreateProjectDataLatest.and.returnValue(of([project('a')]));
    component.load();
    expect(component.error).toBe('');
    expect(component.filtered.length).toBe(1);
  });
  it('updates chart counts from search and filters rows by the selected status', () => {
    const { component } = setup(false, of([project('a'), project('b', 'ACCEPTED'), project('c', 'CLOSED', { departmentPI: 'Surgery' })]));
    component.load();
    component.query = 'medicine'; component.rebuild(); component.selectStatus('ACCEPTED');
    expect(component.filtered.map(row => row.projectId)).toEqual(['b']);
    expect(component.counts.find(item => item.key === 'SUBMITTED')?.count).toBe(1);
    expect(component.counts.find(item => item.key === 'CLOSED')?.count).toBe(0);
    component.clearFilters();
    expect(component.filtered.length).toBe(3);
    expect(component.selectedStatus).toBe('');
  });
  it('paginates at 15 rows and resets the page after filters change', () => {
    const { component } = setup(false, of(Array.from({ length: 17 }, (_, i) => project(String(i)))));
    component.load();
    expect(component.visibleProjects.length).toBe(15);
    component.page = 1;
    expect(component.visibleProjects.length).toBe(2);
    component.query = 'nothing'; component.rebuild();
    expect(component.page).toBe(0);
    expect(component.filtered).toEqual([]);
  });
  it('opens read-only history by UUID for ordinary users and denies management actions', () => {
    const { component, dialog, service, notifications } = setup();
    const row = project('stable-uuid');
    component.viewHistory(row);
    expect(dialog.open.calls.mostRecent().args[1].data).toEqual({ dataKey: 'stable-uuid', readOnly: true });
    dialog.open.calls.reset();
    component.edit(row); component.changeStatus(row); component.archive(row);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(service.populateForm).not.toHaveBeenCalled();
    expect(notifications.confirmation).not.toHaveBeenCalled();
  });
  it('preserves UUID/version metadata and does not mutate a row when editing', () => {
    const { component, service } = setup(true);
    const row = project('stable-uuid', 'ACCEPTED', { versionNumber: 3, modality: '[one],two' });
    component.edit(row);
    expect(service.populateForm.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ projectId: 'stable-uuid', versionNumber: 3, modality: ['one', 'two'] }));
    expect(row.modality).toBe('[one],two');
  });
  it('archives only after confirmation, using the project UUID', () => {
    const { component, notifications, service } = setup(true);
    component.archive(project('stable-uuid'));
    expect(service.archiveProject).not.toHaveBeenCalled();
    notifications.confirmation.calls.mostRecent().args[1]();
    expect(service.archiveProject).toHaveBeenCalledWith('stable-uuid');
  });
  it('keeps the editor open during guarded navigation and closes it only after route destruction', () => {
    const { component, dialog } = setup(true);
    component.edit(project('stable-uuid'));
    expect(dialog.open.calls.mostRecent().args[1].closeOnNavigation).toBeFalse();
    const editor = dialog.open.calls.mostRecent().returnValue;
    expect(editor.close).not.toHaveBeenCalled();
    component.ngOnDestroy();
    expect(editor.close).toHaveBeenCalledTimes(1);
  });
  it('redirects the guarded legacy route without fetching a duplicate list', () => {
    const { component, router, service } = setup(true);
    router.url = '/CreateProjectManagement';
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/projects'], { replaceUrl: true });
    expect(service.getCreateProjectDataLatest).not.toHaveBeenCalled();
  });
  it('keeps archived projects discoverable, deduplicated and read-only without changing active counts', () => {
    const { component, service, dialog } = setup(true, of([project('active')]));
    component.load();
    service.getCreateProjectData.and.returnValue(of([
      project('old', 'CLOSED', { archived: true }), project('old', 'CLOSED', { versionNumber: 2, archived: true }), project('active'),
    ]));
    component.toggleArchived();
    expect(component.projects.length).toBe(1);
    expect(component.projects[0].versionNumber).toBe(2);
    component.viewHistory(component.projects[0]);
    expect(dialog.open.calls.mostRecent().args[1].data).toEqual({ dataKey: 'old', readOnly: true });
    dialog.open.calls.reset();
    component.edit(component.projects[0]); component.changeStatus(component.projects[0]);
    expect(dialog.open).not.toHaveBeenCalled();
    component.toggleArchived();
    expect(component.projects.map(row => row.projectId)).toEqual(['active']);
  });
});

describe('Rendered project overview', () => {
  async function render(admin = false, response: any = of([project('a'), project('b', 'ACCEPTED')])) {
    const service = { getCreateProjectDataLatest: jasmine.createSpy('load').and.returnValue(response) };
    await TestBed.configureTestingModule({
      declarations: [ProjectsComponent],
      imports: [CommonModule, FormsModule, SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: CreateProjectService, useValue: service },
        { provide: TokenStorageService, useValue: { getToken: () => 'synthetic-token', getUser: () => ({ roles: [admin ? 'ROLE_ADMIN' : 'ROLE_USER'] }) } },
        { provide: MatDialog, useValue: { open: jasmine.createSpy('open') } },
        { provide: NotificationService, useValue: {} },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ProjectsComponent);
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    return { fixture, element: fixture.nativeElement as HTMLElement, service };
  }
  it('filters rendered rows when a keyboard-operable status button is clicked and hides user management controls', async () => {
    const { fixture, element } = await render();
    expect(element.querySelectorAll('tbody tr').length).toBe(2);
    (element.querySelector('[aria-label="Accepted: 1 projects"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr').length).toBe(1);
    expect(element.querySelector('tbody')?.textContent).toContain('Project b');
    expect(element.querySelector('[aria-label^="Manage "]')).toBeNull();
    expect(element.textContent).not.toContain('View archived projects');
  });
  it('shows management menus only for administrators', async () => {
    const { element } = await render(true);
    expect(element.querySelectorAll('[aria-label^="Manage "]').length).toBe(2);
    expect(element.textContent).toContain('View archived projects');
  });
  it('labels the archived table accurately for assistive technology', async () => {
    const { fixture, element } = await render(true);
    expect(element.querySelector('caption')?.textContent).toBe('Shared active research projects');
    fixture.componentInstance.showArchived = true;
    fixture.detectChanges();
    expect(element.querySelector('caption')?.textContent).toBe('Shared archived research projects');
  });
  it('does not render a chart during loading or a request failure, then permits retry', async () => {
    const pending = new Subject<newProjectResponse[]>();
    const { fixture, element, service } = await render(false, pending);
    expect(element.textContent).toContain('Loading projects');
    expect(element.querySelector('.status-bars')).toBeNull();
    pending.error({ status: 500 }); fixture.detectChanges();
    expect(element.textContent).toContain('could not be loaded');
    expect(element.querySelector('.status-bars')).toBeNull();
    service.getCreateProjectDataLatest.and.returnValue(of([]));
    (Array.from(element.querySelectorAll('button')).find(button => button.textContent === 'Retry') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Create the first project');
    expect(element.querySelector('.status-bars')).toBeNull();
  });
  it('renders the next page when Next is activated', async () => {
    const { fixture, element } = await render(false, of(Array.from({ length: 17 }, (_, i) => project(String(i)))));
    expect(element.querySelectorAll('tbody tr').length).toBe(15);
    (Array.from(element.querySelectorAll('button')).find(button => button.textContent === 'Next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelectorAll('tbody tr').length).toBe(2);
    expect(element.textContent).toContain('Page 2 of 2');
  });
});
