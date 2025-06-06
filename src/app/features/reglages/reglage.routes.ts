import { Routes } from '@angular/router';
import { ReglagesComponent } from './reglages.component';
import { CategorySelectionComponent } from '../../shared/components/category-selection/category-selection.component';
import { RisksComponent } from './risks/risks.component';
import { CreateProcessComponent } from '../process/create-process/create-process.component';
import { CreateRisksComponent } from './risks/create-risks/create-risks.component';

export const reglagesRoute: Routes = [
  { path: '', component: ReglagesComponent },
  { path: 'entites', component: CategorySelectionComponent },
  { path: 'process', component: CreateProcessComponent },
  { path: 'risks', component: RisksComponent },
  { path: 'risks/create', component: CreateRisksComponent },
  // { path: 'risks/:id', component: CreateRisksComponent },
];