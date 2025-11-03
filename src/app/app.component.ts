import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from "./layout/footer/footer.component";
import { LoadingComponent } from "./shared/components/loading/loading.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from "./layout/sidebar/sidebar.component";
import { filter } from 'rxjs';
import { DraftBannerComponent } from './shared/components/draft-banner/draft-banner.component';
import { CreateActionPlanDialogComponent } from './features/action-plan/create-action-plan-dialog/create-action-plan-dialog.component';
import { AddEntityDialogComponent } from './features/reglages/add-entity-dialog/add-entity-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DraftService } from './core/services/draft.service';
import { CreateControlComponent } from './features/control/create-control/create-control.component';
import { CreateAttenuationMetricsComponent } from './features/control/create-attenuation-metrics/create-attenuation-metrics.component';
import { CreateProcessComponent } from './features/process/create-process/create-process.component';
import { CreateRisksComponent } from './features/reglages/risks/create-risks/create-risks.component';
import { PopupEvaluationControleComponent } from './pages/control-details-page/popup-evaluation-controle/popup-evaluation-controle/popup-evaluation-controle.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, LoadingComponent, MatSidenavModule, SidebarComponent, DraftBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'risk-view';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  private dialog = inject(MatDialog);
  private draftService = inject(DraftService);

  ngOnInit(): void {
    // Écoute l'événement de restauration de brouillon
    window.addEventListener('restoreDraft', (event: any) => {
      this.handleRestoreDraft(event.detail);
    });
  }

  private handleRestoreDraft(draft: any): void {
    switch (draft.component) {
      case 'AddEntityDialog':
        this.dialog.open(AddEntityDialogComponent, {
          width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: { 
            draftId: draft.id
          }
        });
        break;
      
      case 'CreateActionPlanDialog':
        const actionPlanDraft = this.draftService.getDraftById(draft.id);
        const actionPlanData: any = { 
          draftId: draft.id
        };
        
        if (actionPlanDraft?.data?.incidentData) {
          actionPlanData.incidentId = actionPlanDraft.data.incidentData.incidentId;
          actionPlanData.reference = actionPlanDraft.data.incidentData.reference;
        }
        
        this.dialog.open(CreateActionPlanDialogComponent, {
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: actionPlanData
        });
        break;

      case 'CreateControlDialog':
        this.dialog.open(CreateControlComponent, {
          width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: { 
            draftId: draft.id
          }
        });
        break;

      case 'CreateAttenuationMetricsDialog':
        this.dialog.open(CreateAttenuationMetricsComponent, {
          width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: { 
            draftId: draft.id
          }
        });
        break;

      case 'CreateProcessDialog':
        this.dialog.open(CreateProcessComponent, {
          width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: { 
            draftId: draft.id
          }
        });
        break;
        
      case 'CreateRisksComponent':
        this.dialog.open(CreateRisksComponent, {
          width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: {
            draftId: draft.id
          }
        });
        break;

        case 'PopupEvaluationControleComponent':
        this.dialog.open(PopupEvaluationControleComponent, {
          width: '800px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: 'custom-dialog-container',
          data: {
            draftId: draft.id
          }
        });
        break;

      default:
        console.warn('Unknown draft component:', draft.component);
    }
  }
}