import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { RiskService } from '../../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../../core/models/RiskTemplate';
import { RiskEvaluation } from '../../../../core/models/RiskEvaluation';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
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
      queryParams: { id: this.risk?.id.id, version: this.risk?.id.version }
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
