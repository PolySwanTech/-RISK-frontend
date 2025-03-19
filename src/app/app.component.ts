import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./layout/footer/footer.component";
import { LoadingComponent } from "./shared/components/loading/loading.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from "./layout/sidebar/sidebar.component";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, LoadingComponent, MatSidenavModule, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'risk-view';
}
