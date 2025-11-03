import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../../core/models/RiskTemplate';
import { RiskEvaluation, RiskEvaluationDto } from '../../../../core/models/RiskEvaluation';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoBackComponent } from '../../../../shared/components/go-back/go-back.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ControlService } from '../../../../core/services/dmr/control/control.service';
import { catchError, forkJoin, of } from 'rxjs';
import { ControlEvaluationView } from '../../../../core/models/ControlEvaluation';
import { IncidentListDto } from '../../../../core/models/Incident';
import { IncidentService } from '../../../../core/services/incident/incident.service';
import { RiskEvaluationService } from '../../../../core/services/risk-evaluation/risk-evaluation.service';
import { ControlExecutionView } from '../../../../core/models/ControlExecution';
import { EnumLabelPipe } from '../../../../shared/pipes/enum-label.pipe';


@Component({
  standalone: true,
  imports: [
    CommonModule, MatDividerModule, GoBackComponent, MatProgressSpinnerModule, 
    MatExpansionModule, MatIconModule, EnumLabelPipe
  ],
  selector: 'app-risk-detail',
  templateUrl: './risk-detail.component.html',
  styleUrls: ['./risk-detail.component.scss']
})
export class RiskDetailComponent implements OnInit, OnDestroy {

  risk?: RiskTemplate;
  lastEvaluation?: RiskEvaluation;
  loading = true;
  private destroy$ = new Subject<void>();
  private controlService = inject(ControlService);
  private incidentService = inject(IncidentService);
  
  controlExecutions: Record<string, ControlExecutionView[] | null> = {};
  controlEvaluationCache: Record<string, ControlEvaluationView | null> = {};
  linkedIncidents: IncidentListDto[] = [];
  riskEvaluations: RiskEvaluationDto[] = [];
  groupedEvaluations?: { period: string, brut?: RiskEvaluationDto, net?: RiskEvaluationDto }[] = [];

  goBackButtons = [
    // {
    //   label: 'Évaluer ce risque',
    //   icon: '', // pas d’icône ici, ou ajoute-en si tu veux (ex: 'assessment')
    //   class: 'mat-primary', // ou remplace par 'btn-primary' si tu utilises des classes
    //   show: true,
    //   action: () => this.onEvaluate()
    // },
    // {
    //   label: 'Générer Rapport',
    //   icon: '', // idem
    //   class: 'mat-accent outlined', // à styliser si tu veux un style stroked
    //   show: true,
    //   action: () => {} // à ajouter si fonction disponible
    // }
    ];

  // get frequency() : number | string {
  //   return (this.risk?.dmr?.[0]?.probability || 0) * 10 || '-';
  // }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private riskService: RiskService,
    private riskEvaluationService: RiskEvaluationService
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => this.riskService.getById(params.get('id')!))
      )
      .subscribe({
        next: (risk) => {
          this.risk = risk;
          this.loading = false;

          risk.dmr?.controls?.forEach(control => {
            this.loadControlExecutions(control.id);
          });

          this.incidentService.getIncidentByProcessAndRisk(risk.id).subscribe(incidents => {this.linkedIncidents = incidents;});
          this.riskEvaluationService.getEvaluationsByRisk(risk.id).subscribe(evals => {this.riskEvaluations = evals; this.groupEvaluations();});
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/reglages/risks']);
        }
      });
  }

  loadControlExecutions(controlId: string): void {
  this.controlService.getAllExecutions(controlId).subscribe(executions => {
    const sorted = [...executions].sort((a, b) =>
      new Date(b.plannedAt as any).getTime() - new Date(a.plannedAt as any).getTime()
    );
    this.controlExecutions[controlId] = sorted;

    const calls = executions.map(e =>
      this.controlService.getEvaluationByExecution(e.id).pipe(catchError(() => of(null)))
    );

    forkJoin(calls).subscribe(views => {
      executions.forEach((e, i) => this.controlEvaluationCache[e.id] = views[i] as ControlEvaluationView | null);
    });
  });
}


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  activeTab = 'controls';

  selectTab(tab: 'controls' | 'evaluations' | 'mitigations' ): void {
    this.activeTab = tab;
  }
    
  evalLabel(s: string | undefined): string {
    if (!s) return '—';
    const v = (s || '').toUpperCase();
    if (v.includes('PARTIEL')) return 'Partiellement conforme';
    if (v.includes('NON')) return 'Non conforme';
    if (v.includes('CONF')) return 'Conforme';
    return '—';
  }

  private groupEvaluations(): void {
    const map = new Map<string, { period: string, brut?: RiskEvaluationDto, net?: RiskEvaluationDto }>();

    this.riskEvaluations.forEach(evalDto => {
      const key = `${evalDto.evaluationPeriod}`;
      if (!map.has(key)) {
        map.set(key, {
          period: `${evalDto.evaluationPeriod}`,
        });
      }
      const entry = map.get(key)!;
      if (evalDto.brut) {
        entry.brut = evalDto;
      } else {
        entry.net = evalDto;
      }
    });

    this.groupedEvaluations = Array.from(map.values());
  }

  goToIncidents(): void {
    if (!this.risk) return;
    this.router.navigate(['incident'], {
      queryParams: { riskId: this.risk.id, processId: this.risk!.processId }
    });
  }
    
}
