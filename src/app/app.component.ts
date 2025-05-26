import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from "./layout/footer/footer.component";
import { LoadingComponent } from "./shared/components/loading/loading.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, LoadingComponent, MatSidenavModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'risk-view';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // smooth = animation douce
      });
  }
}
