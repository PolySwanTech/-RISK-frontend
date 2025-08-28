import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sub-menu-carto',
  standalone: true,
  imports: [],
  templateUrl: './sub-menu-carto.component.html',
  styleUrls: ['./sub-menu-carto.component.scss']
})
export class SubMenuCartoComponent {
  constructor(private router: Router) {}

  goCreate()    { this.router.navigate(['/cartographie/creer']); }
  goConsult()   { this.router.navigate(['/cartographie/consulter']); }
  goEval()      { this.router.navigate(['/cartographie/evaluation']); }
}
