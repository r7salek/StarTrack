import {
  CommonModule,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  DxButtonModule,
  DxDataGridModule,
  DxFormModule,
  DxSpeedDialActionModule,
  DxTemplateModule,
} from 'devextreme-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { authInterceptorProviders } from './core/login/_helpers/auth.interceptor';
import { AdminAuthGuard } from './core/login/_services/admin-auth-guard.service';
import { CreateProjectComponent } from './CreateProject/CreateProject.component';
import { CreateProjectHistoryComponent } from './CreateProjectManagement/CreateProjectHistory/CreateProjectHistory.component';
import { CreateProjectManagementComponent } from './CreateProjectManagement/CreateProjectManagement.component';
import { ProjectCreateDetailsComponent } from './CreateProjectManagement/ProjectCreateDetails/ProjectCreateDetails.component';
import { UpdateProjectComponent } from './CreateProjectManagement/updateProject/updateProject.component';
import { UpdateProposalStatusComponent } from './CreateProjectManagement/UpdateProposalStatus/UpdateProposalStatus.component';
import { UserService } from './services/user.service';
import { SharedModule } from './Shared/Shared.module';
import { ChangePasswordComponent } from './user/EditedUserProfile/changePassword/changePassword.component';
import { EditedUserProfileComponent } from './user/EditedUserProfile/EditedUserProfile.component';
import { UserComponent } from './user/user.component';
import { UM_approveRequestComponent } from './userManagement/UM_approveRequest/UM_approveRequest.component';
import { UM_usersComponent } from './userManagement/UM_users/UM_users.component';
import { UpdateUserComponent } from './userManagement/UpdateUser/UpdateUser.component';
import { UserManagementComponent } from './userManagement/userManagement.component';

@NgModule({
  declarations: [
    AppComponent,
    UserManagementComponent,
    UserComponent,
    EditedUserProfileComponent,
    ChangePasswordComponent,
    UM_approveRequestComponent,
    UM_usersComponent,
    UpdateUserComponent,
    CreateProjectComponent,
    CreateProjectManagementComponent,
    ProjectCreateDetailsComponent,
    UpdateProjectComponent,
    CreateProjectHistoryComponent,
    UpdateProposalStatusComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    DxButtonModule,
    BrowserModule,
    DxFormModule,
    DxSpeedDialActionModule,
    // DashboardModule,
    DxDataGridModule,
    DxTemplateModule,
    CommonModule,
    FormsModule,
  ],
  exports: [HttpClientModule],
  providers: [
    UserService,
    authInterceptorProviders,
    AdminAuthGuard,
    HttpClientModule,
    HttpClientModule,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
