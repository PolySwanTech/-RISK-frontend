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
import { IncidentService } from '../../core/services/incident/incident.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: true,
  imports: [
    HasPermissionDirective,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    AsyncPipe, CommonModule,
    RouterModule,
    MatMenuModule, RouterLink, MatBadgeModule],
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isSidebarOpen = true;
  unreadIncidents = 0;

  currentRoute: string = '';

  storageSubscription: any;

  constructor(private router: Router, public authService : AuthService, private incidentService : IncidentService) { }

  ngOnInit(): void {
    this.updateLoginStatus();
    const token = this.authService.decryptToken();
    setTimeout(() => {
      if(!this.authService.isTokenExpired(token)){
        this.incidentService.countIncidentsNonClotures().subscribe(resp => {
          this.unreadIncidents = resp;
         })
      }
    }, 1000)
    
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
    this.authService.logout();
  }
}