import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../../core/models/RiskTemplate';
import { RiskEvaluation } from '../../../../core/models/RiskEvaluation';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoBackComponent } from '../../../../shared/components/go-back/go-back.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    GoBackComponent,
    MatProgressSpinnerModule],
  selector: 'app-risk-detail',
  templateUrl: './risk-detail.component.html',
  styleUrls: ['./risk-detail.component.scss']
})
export class RiskDetailComponent implements OnInit, OnDestroy {

  risk?: RiskTemplate;
  lastEvaluation?: RiskEvaluation;
  loading = true;
  private destroy$ = new Subject<void>();

  goBackButtons = [
  {
    label: 'Évaluer ce risque',
    icon: '', // pas d’icône ici, ou ajoute-en si tu veux (ex: 'assessment')
    class: 'mat-primary', // ou remplace par 'btn-primary' si tu utilises des classes
    show: true,
    action: () => this.onEvaluate()
  },
  {
    label: 'Générer Rapport',
    icon: '', // idem
    class: 'mat-accent outlined', // à styliser si tu veux un style stroked
    show: true,
    action: () => {} // à ajouter si fonction disponible
  }
];

  get probability() : number | string {
    return (this.risk?.rpc[0]?.probability || 0) * 10 || '-'
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private riskService: RiskService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => this.riskService.getById(params.get('id')!))
      )
      .subscribe({
        next: (risk) => {
          this.risk = risk;
          if (risk.riskEvaluations?.length) {
            this.lastEvaluation = risk.riskEvaluations[risk.riskEvaluations.length - 1];
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/reglages/risks']);
        }
      });

  }

  onEvaluate(): void {
    this.router.navigate(['/reglages/risks/evaluation'], {
      queryParams: { id: this.risk?.id.id, version: this.risk?.id.version },
      state: { risk: this.risk }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  activeTab = 'controls';

  selectTab(tab: 'controls' | 'evaluations' | 'impacts') {
    this.activeTab = tab;
  }
}
