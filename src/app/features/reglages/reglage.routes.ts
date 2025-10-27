import { Routes } from '@angular/router';
import { CreateRisksComponent } from './risks/create-risks/create-risks.component';
import { RiskDetailComponent } from './risks/risk-detail/risk-detail.component';
import { ReglagesComponent } from './reglages/reglages.component';
import { CreateRisksReferentielComponent } from './risks/create-risks-referentiel/create-risks-referentiel.component';
import { ProcessManagerComponent } from '../../shared/components/param-process/param-process.component';

export const reglagesRoute: Routes = [
  { path: '', component: ReglagesComponent },
  {
    path: 'risks',
    children: [
      { path: 'create-referentiel',  component: CreateRisksReferentielComponent },
      { path: 'create-referentiel/:id',  component: CreateRisksReferentielComponent },
      { path: 'create',  component: CreateRisksComponent },
      { path: 'create/:id',  component: CreateRisksComponent },
      { path: ':id',         component: RiskDetailComponent },
    ]
  },
  {
    path: 'process', component : ProcessManagerComponent
  }
];