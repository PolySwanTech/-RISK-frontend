import { Component, inject, OnInit } from '@angular/core';
import { ActionPlan } from '../../../core/models/ActionPlan';
import { EntiteResponsable } from '../../../core/models/EntiteResponsable';
import { Impact } from '../../../core/models/Impact';
import { Process } from '../../../core/models/Process';
import { Risk } from '../../../core/models/Risk';
import { Statut } from '../../../core/models/Statut';
import { MatFormField } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskService } from '../../../core/services/risk/risk.service';
import { EntitiesService } from '../../../core/services/entities/entities.service';
import { ProcessService } from '../../../core/services/process/process.service';
import { Utilisateur } from '../../../core/models/Utilisateur';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur.service';
import { UtilisateurProfil } from '../../../core/models/UtilisateurProfil';
import { ActionPlanService } from '../../../core/services/action-plan/action-plan.service';
import { Priority } from '../../../core/models/Priority';

@Component({
  selector: 'app-create-action-plan-dialog',
  imports: [FormsModule],
  templateUrl: './create-action-plan-dialog.component.html',
  styleUrl: './create-action-plan-dialog.component.scss'
})
export class CreateActionPlanDialogComponent implements OnInit {

  riskService = inject(RiskService);
  buService = inject(EntitiesService);
  processService = inject(ProcessService);
  userService = inject(UtilisateurService);
  actionPlanService = inject(ActionPlanService);

  actionPlan: ActionPlan = new ActionPlan(
    '', '', '', '', null!, null!, '', null!, new Date(), null!, null!, null!
  );

  risks: Risk[] = [/* à remplir */];
  impacts: Impact[] = [/* à remplir */];
  statuts = Object.values(Statut);
  priorities = Object.values(Priority);
  entitesResponsables: EntiteResponsable[] = [/* à remplir */];
  processes: Process[] = [/* à remplir */];
  responsables: Utilisateur[] = [/* à remplir */];

  entiteResponsableId = ""
  processId = "";


  ngOnInit(): void {
    this.buService.loadEntities().subscribe(entites => {
      this.entitesResponsables = entites;
    });

    this.userService.getUsers().subscribe(responsables => {
      this.responsables = responsables;
    });
  }

  onSubmit() {
    console.log('Action Plan:', this.actionPlan);
    this.actionPlanService.createActionPlan(this.actionPlan).subscribe(
      response => {
        console.log('Action Plan créé avec succès', response);
        // ici tu peux fermer le dialog ou faire autre chose
      },
      error => {
        console.error('Erreur lors de la création de l\'Action Plan', error);
      }
    );
  }

  onProcessChange() {
    if (this.processId) {
      this.riskService.getAllByProcess(this.processId).subscribe(risks => {
        this.risks = risks;
      });
    }
  }

  onEntiteResponsableChange() {
    this.processService.getAllByEntite(this.entiteResponsableId).subscribe(processes => {
      this.processes = processes;
    });
  }
}
