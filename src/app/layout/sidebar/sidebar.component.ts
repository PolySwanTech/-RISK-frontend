import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    AsyncPipe,
    MatMenuModule, RouterLink, MatBadgeModule],
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isSidebarOpen = true;
  unreadIncidents = 5;

  currentRoute: string = '';

  storageSubscription: any;

  constructor(private router: Router, public authService : AuthService) { }

  ngOnInit(): void {
    this.updateLoginStatus();
  }

  // Method to update login status
  updateLoginStatus(): void {
    const token = sessionStorage.getItem('token');
    this.authService.isLogin$.next(!!token);
  }

  // Set the active route based on the clicked link
  setActive(route: string) {
    this.currentRoute = route;
  }

  // Check if the current route matches the given route
  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  onLogout() {
    sessionStorage.clear();
    this.updateLoginStatus();
    this.router.navigateByUrl('/auth/login')
  }
}