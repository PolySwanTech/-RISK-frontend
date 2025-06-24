import { Routes } from '@angular/router';
import { ReglagesComponent } from './reglages.component';
import { CategorySelectionComponent } from '../../shared/components/category-selection/category-selection.component';
import { RisksComponent } from './risks/risks.component';
import { CreateProcessComponent } from '../process/create-process/create-process.component';
import { CreateRisksComponent } from './risks/create-risks/create-risks.component';
import { CreateRisksEvaluationsComponent } from './risks/risk-evaluation/create-risks-evaluations/create-risks-evaluations.component';
import { RiskDetailComponent } from './risks/risk-detail/risk-detail.component';

export const reglagesRoute: Routes = [
  { path: '', component: ReglagesComponent },
  { path: 'entites', component: CategorySelectionComponent },
  { path: 'process', component: CreateProcessComponent },
  {
    path: 'risks',
    children: [
      { path: '',        component: RisksComponent },
      { path: 'create',  component: CreateRisksComponent },
      { path: 'evaluation',  component: CreateRisksEvaluationsComponent },
      { path: ':id',         component: RiskDetailComponent },
    ]
  }
  
];