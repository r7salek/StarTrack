import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { LoginCheck } from './core/login/_services/LoginCheck.service';

describe('AppRoutingModule', () => {
  it('protects the profile route with LoginCheck', () => {
    TestBed.configureTestingModule({ imports: [AppRoutingModule] });
    const profileRoute = TestBed.inject(Router).config.find(
      (route) => route.path === 'profile'
    );

    expect(profileRoute).toBeDefined();
    expect(profileRoute?.canActivate).toContain(LoginCheck);
  });
});
