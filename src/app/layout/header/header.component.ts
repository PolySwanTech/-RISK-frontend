import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {MatBadgeModule} from '@angular/material/badge';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, CommonModule, MatBadgeModule,
    RouterLink, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  unreadIncidents = 5;

  currentRoute: string = '';

  constructor(private router: Router) {}

  // Set the active route based on the clicked link
  setActive(route: string) {
    this.currentRoute = route;
  }

  // Check if the current route matches the given route
  isActive(route: string): boolean {
    return this.currentRoute === route;
  }
}
