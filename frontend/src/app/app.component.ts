import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TokenStorageService } from './core/login/_services/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('mainContent', { static: true }) mainContent?: ElementRef<HTMLElement>;

  focusContent(routeChanged = false): void {
    if (routeChanged) window.scrollTo(0, 0);
    this.mainContent?.nativeElement.focus({ preventScroll: routeChanged });
  }
  private roles: string[] = [];
  isLoggedIn = false;
  showAdminBoard = false;
  showModeratorBoard = false;
  userName!: string;

  constructor(private tokenStorageService: TokenStorageService) {}

  ngOnInit(): void {
    const user = this.tokenStorageService.getUser();
    this.isLoggedIn = !!this.tokenStorageService.getToken() && !!user;

    if (this.isLoggedIn) {
      this.roles = user.roles;
      this.userName = user.userName;
    } else {
      this.roles = [];
      this.userName = '';
    }
  }
}
