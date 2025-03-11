import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorySelectionComponent } from '../../shared/components/category-selection/category-selection.component';

@Component({
  selector: 'app-reglages',
  imports: [CommonModule, CategorySelectionComponent],
  templateUrl: './reglages.component.html',
  styleUrl: './reglages.component.scss'
})
export class ReglagesComponent {

  settings = true
}
