import { Component, OnInit } from '@angular/core';
import { UtilisateurService } from '../../core/services/utilisateur/utilisateur.service';
import { MatCardModule } from '@angular/material/card';
import { MatrixComponent } from "../../features/risk/matrix/matrix.component";
import { ActionPlanChartComponent } from "../../features/action-plan/action-plan-chart/action-plan-chart/action-plan-chart.component";
import { ControlChartComponent } from "../../features/control/control-chart/control-chart/control-chart.component";

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatrixComponent, ActionPlanChartComponent, ControlChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  cards = [
    { title: 'Incidents en cours', value: 3200 },
    { title: `Nombre d'utilisateur`, value: 120 },
    { title: 'Total incidents sur l\'année', value: 5400 },
    { title: 'Total € provisionés', value: 50 },
    { title: 'Total incident N-1', value: 230 },
    { title: 'Délai moyen traitement (en jours)', value: 15 }
  ];
  
  constructor(private utilisateurService : UtilisateurService){
  }

  ngOnInit() {
  }
}
