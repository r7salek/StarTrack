import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { LoginCheck } from './core/login/_services/LoginCheck.service';
import { AdminAuthGuard } from './core/login/_services/admin-auth-guard.service';

describe('AppRoutingModule', () => {
  it('permits approved users into projects and creation while guarding legacy management', () => {
    TestBed.configureTestingModule({ imports: [AppRoutingModule] });
    const routes = TestBed.inject(Router).config;
    for (const path of ['projects', 'createProject']) {
      expect(routes.find(route => route.path === path)?.canActivate).toEqual([LoginCheck]);
    }
    expect(routes.find(route => route.path === 'CreateProjectManagement')?.canActivate).toEqual([AdminAuthGuard]);
    expect(routes.find(route => route.path === 'user-management')?.canActivate).toEqual([AdminAuthGuard]);
  });
  it('protects the profile route with LoginCheck', () => {
    TestBed.configureTestingModule({ imports: [AppRoutingModule] });
    const profileRoute = TestBed.inject(Router).config.find(
      (route) => route.path === 'profile'
    );

    expect(profileRoute).toBeDefined();
    expect(profileRoute?.canActivate).toContain(LoginCheck);
  });
});
