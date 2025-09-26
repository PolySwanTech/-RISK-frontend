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
import { ControlService } from '../../../../core/services/control/control.service';
import { catchError, forkJoin, of } from 'rxjs';
import { ControlExecution } from '../../../../core/models/ControlExecution';
import { ControlEvaluationView } from '../../../../core/models/ControlEvaluation';
import { Status, StatusLabels } from '../../../../core/enum/status.enum';
import { ControlTypeLabels, Type } from '../../../../core/enum/controltype.enum';
import { Recurrence, RecurrenceLabels } from '../../../../core/enum/recurrence.enum';
import { Degree, DegreeLabels } from '../../../../core/enum/degree.enum';
import { EvaluationControl, EvaluationControlLabels } from '../../../../core/enum/evaluation-controle.enum';
import { Incident } from '../../../../core/models/Incident';
import { IncidentService } from '../../../../core/services/incident/incident.service';
import { RiskEvaluationService } from '../../../../core/services/risk-evaluation/risk-evaluation/risk-evaluation.service';
import { RiskLevelEnum, RiskLevelLabels } from '../../../../core/enum/riskLevel.enum';
import { State, StateLabels } from '../../../../core/enum/state.enum';


@Component({
  standalone: true,
  imports: [
    CommonModule, MatDividerModule, GoBackComponent, MatProgressSpinnerModule, MatExpansionModule, MatIconModule],
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
  
  controlExecutions: Record<string, ControlExecution[] | null> = {};
  controlEvaluationCache: Record<string, ControlEvaluationView | null> = {};
  linkedIncidents: Incident[] = [];
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
            this.loadControlExecutions(control.id.id);
          });

          this.incidentService.getIncidentByProcessAndRisk(risk.processId || '', risk.id.id).subscribe(incidents => {this.linkedIncidents = incidents;});
          this.riskEvaluationService.getEvaluationsByRisk(risk.id.id).subscribe(evals => {this.riskEvaluations = evals; this.groupEvaluations();});
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

  getStatusLabel(s: Status | undefined): string {
    return s ? StatusLabels[s] : '—';
  }

  getControlTypeLabel(t: Type): string {
    return ControlTypeLabels[t] || '—';
  }

  getFrequencyLabel(freq: Recurrence): string {
    return RecurrenceLabels[freq] || '—';
  }

  getControlLevelLabel(level: Degree): string {
    return DegreeLabels[level] || '—';
  }

  getEvaluationControlLabel(e: EvaluationControl | undefined): string {
    return e ? EvaluationControlLabels[e] : '—';
  }

  getEvaluationLabel(e: RiskLevelEnum | undefined): string {
    return e ? RiskLevelLabels[e] : '—';
  }

  getStateLabel(s: State | undefined): string {
    return s ? StateLabels[s] : '—';
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
      const key = `${evalDto.exercicePeriod.start}_${evalDto.exercicePeriod.end}`;
      if (!map.has(key)) {
        map.set(key, {
          period: `${evalDto.exercicePeriod.start} - ${evalDto.exercicePeriod.end}`,
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
      queryParams: { riskId: this.risk.id.id, processId: this.risk!.processId }
    });
  }
    
}
