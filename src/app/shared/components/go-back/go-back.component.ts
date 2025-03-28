import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss']
})
export class GoBackComponent implements OnInit {
  @Input() previousPageName: string = '';
  @Input() currentPageName: string = '';
  @Input() redirectUrl: string[] = [];

  previousPage: string = 'Accueil'; // Valeur par défaut
  currentPage: string = '';

  constructor(private location: Location, private route: ActivatedRoute, private router: Router) {
  }

  
  ngOnInit() {
    this.updatePageNames()
  }

  private updatePageNames() {
    const paths = this.router.url.split('/').filter(p => p);
    
    if (paths.length > 1) {
      this.previousPage = this.previousPageName || paths[paths.length - 2].replace(/-/g, ' ');
    }
    this.currentPage = this.currentPageName || paths[paths.length - 1].replace(/-/g, ' ');
  }

  goBack() {
    this.redirectUrl.length != 0 ? this.router.navigate(this.redirectUrl) : this.location.back();
  }
}