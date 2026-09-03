import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './core/Home/Home.component';
import { AdminAuthGuard } from './core/login/_services/admin-auth-guard.service';
import { AuthGuard } from './core/login/_services/AuthGuardService.service';
import { LoginCheck } from './core/login/_services/LoginCheck.service';
import { ProfileComponent } from './core/profile/profile.component';
import { RegisterComponent } from './core/register/register.component';
import { CreateProjectComponent } from './CreateProject/CreateProject.component';
import { CreateProjectManagementComponent } from './CreateProjectManagement/CreateProjectManagement.component';
import { UserComponent } from './user/user.component';
import { UserManagementComponent } from './userManagement/userManagement.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [LoginCheck],
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [AdminAuthGuard],
  },
  {
    path: 'createProject',
    component: CreateProjectComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'CreateProjectManagement',
    component: CreateProjectManagementComponent,
    canActivate: [AdminAuthGuard],
  },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
