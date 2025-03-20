import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent {
  previousPage: string = 'Accueil'; // Valeur par défaut
  currentPage: string = '';

  constructor(private location: Location, private route: ActivatedRoute, private router: Router) {
    this.route.url.subscribe(() => {
      const paths = this.router.url.split('/').filter(p => p);
      if (paths.length > 1) {
        this.previousPage = paths[paths.length - 2].replace(/-/g, ' ');
      }
      this.currentPage = paths[paths.length - 1].replace(/-/g, ' ');
    });
  }

  goBack() {
    this.location.back();
  }
}