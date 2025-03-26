import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reglages',
  imports: [CommonModule],
  templateUrl: './reglages.component.html',
  styleUrl: './reglages.component.scss'
})
export class ReglagesComponent {

  private router = inject(Router);

  settings = true

  navToEntites(){
    this.router.navigate(['reglages', 'entites'])
  }

  navToRisk(){
    this.router.navigate(['reglages', 'risks'])
  }
}
