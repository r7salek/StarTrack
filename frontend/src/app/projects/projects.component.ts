import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TokenStorageService } from '../core/login/_services/token-storage.service';
import { newProjectResponse } from '../models/projectUpdate';
import { CreateProjectService } from '../services/CreateProject.service';
import { NotificationService } from '../services/notification.service';
import { ProjectCreateDetailsComponent } from '../CreateProjectManagement/ProjectCreateDetails/ProjectCreateDetails.component';
import { CreateProjectHistoryComponent } from '../CreateProjectManagement/CreateProjectHistory/CreateProjectHistory.component';
import { UpdateProjectComponent } from '../CreateProjectManagement/updateProject/updateProject.component';
import { UpdateProposalStatusComponent } from '../CreateProjectManagement/UpdateProposalStatus/UpdateProposalStatus.component';
import { latestActiveProjects, latestProjectVersions, piName, PROJECT_STATUSES, ProjectSort, searchProjects, sortProjects, statusKey, statusLabel } from './project-overview';

@Component({
  selector: 'app-projects', templateUrl: './projects.component.html', styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
  projects: newProjectResponse[] = [];
  filtered: newProjectResponse[] = [];
  counts: { key: string; label: string; count: number }[] = [];
  query = '';
  selectedStatus = '';
  sortField: ProjectSort = 'projectName';
  ascending = true;
  page = 0;
  readonly pageSize = 15;
  loading = true;
  error = '';
  archiving = false;
  showArchived = false;
  private readonly destroyed = new Subject<void>();
  private editDialog?: MatDialogRef<UpdateProjectComponent>;
  readonly piName = piName;
  readonly statusLabel = statusLabel;

  constructor(private service: CreateProjectService, private storage: TokenStorageService,
    private dialog: MatDialog, private notifications: NotificationService, private router: Router) {}

  get isAdmin(): boolean {
    return !!this.storage.getToken() && !!this.storage.getUser()?.roles.includes('ROLE_ADMIN');
  }
  get pages(): number { return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get visibleProjects(): newProjectResponse[] { return this.filtered.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize); }
  get maxCount(): number { return Math.max(1, ...this.counts.map(item => item.count)); }

  ngOnInit(): void {
    if (this.router.url?.split('?')[0] === '/CreateProjectManagement') {
      this.router.navigate(['/projects'], { replaceUrl: true });
      return;
    }
    this.load();
  }
  ngOnDestroy(): void {
    this.destroyed.next(); this.destroyed.complete();
    this.editDialog?.close();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const request = this.showArchived && this.isAdmin
      ? this.service.getCreateProjectData() : this.service.getCreateProjectDataLatest();
    request.pipe(takeUntil(this.destroyed)).subscribe({
      next: rows => {
        this.projects = this.showArchived
          ? latestProjectVersions(rows || []).filter(row => row.archived) : latestActiveProjects(rows || []);
        this.loading = false;
        this.rebuild();
      },
      error: () => {
        this.loading = false;
        this.error = 'Projects could not be loaded. Please try again.';
      },
    });
  }
  rebuild(): void {
    const searched = searchProjects(this.projects, this.query);
    this.counts = PROJECT_STATUSES.map(status => ({ ...status,
      count: searched.filter(row => statusKey(row) === status.key).length,
    })).filter((status, index) => index < 4 || status.count > 0);
    this.filtered = sortProjects(searched.filter(row => !this.selectedStatus || statusKey(row) === this.selectedStatus), this.sortField, this.ascending);
    this.page = 0;
  }
  selectStatus(key: string): void { this.selectedStatus = this.selectedStatus === key ? '' : key; this.rebuild(); }
  clearFilters(): void { this.query = ''; this.selectedStatus = ''; this.rebuild(); }
  toggleArchived(): void {
    if (!this.isAdmin || this.loading) return;
    this.showArchived = !this.showArchived;
    this.query = ''; this.selectedStatus = ''; this.load();
  }
  sort(field: ProjectSort): void {
    this.ascending = this.sortField === field ? !this.ascending : true;
    this.sortField = field;
    this.rebuild();
  }
  ariaSort(field: ProjectSort): 'ascending' | 'descending' | 'none' {
    return this.sortField !== field ? 'none' : this.ascending ? 'ascending' : 'descending';
  }
  trackProject(_index: number, row: newProjectResponse): string { return row.projectId; }

  viewDetails(row: newProjectResponse): void {
    this.dialog.open(ProjectCreateDetailsComponent, {
      ...this.largeDialog(), data: { dataKey: this.dialogRow(row) },
    });
  }
  viewHistory(row: newProjectResponse): void {
    this.dialog.open(CreateProjectHistoryComponent, {
      ...this.largeDialog(), data: { dataKey: row.projectId, readOnly: !this.isAdmin || row.archived },
    }).afterClosed().pipe(takeUntil(this.destroyed)).subscribe(() => this.load());
  }
  edit(row: newProjectResponse): void {
    if (!this.isAdmin || row.archived) return;
    const data = this.dialogRow(row);
    this.service.populateForm(data);
    this.editDialog = this.dialog.open(UpdateProjectComponent, {
      ...this.largeDialog(), disableClose: true, closeOnNavigation: false, data: { dataKey: data },
    });
    this.editDialog.afterClosed().pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.editDialog = undefined;
      this.load();
    });
  }
  changeStatus(row: newProjectResponse): void {
    if (!this.isAdmin || row.archived) return;
    this.service.populateForm(row);
    this.dialog.open(UpdateProposalStatusComponent, {
      width: '520px', maxWidth: 'calc(100vw - 32px)', panelClass: 'st-dialog',
    }).afterClosed().pipe(takeUntil(this.destroyed)).subscribe(() => this.load());
  }
  archive(row: newProjectResponse): void {
    if (!this.isAdmin || row.archived || this.archiving) return;
    this.notifications.confirmation('Archive this project? Its versions and history will be retained.', () => {
      if (!this.isAdmin || this.archiving) return;
      this.archiving = true;
      this.service.archiveProject(row.projectId).pipe(takeUntil(this.destroyed)).subscribe({
        next: () => { this.archiving = false; this.notifications.success('Project archived; history retained.'); this.load(); },
        error: () => { this.archiving = false; this.notifications.error('The project could not be archived. Please try again.'); },
      });
    }, 'Archive project');
  }
  private largeDialog() {
    return { width: '1200px', maxWidth: 'calc(100vw - 32px)', height: '90vh', panelClass: 'st-project-dialog', autoFocus: true };
  }
  private dialogRow(row: newProjectResponse): newProjectResponse {
    const values = (value: string | string[]) => (Array.isArray(value) ? value : (value || '').split(','))
      .map(item => item.replace(/^\[|]$/g, '').trim()).filter(Boolean);
    return { ...row, modality: values(row.modality), areaOfExpertise: values(row.areaOfExpertise) };
  }
}
