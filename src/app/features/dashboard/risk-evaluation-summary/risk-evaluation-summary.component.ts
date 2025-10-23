import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { RiskService } from '../../../core/services/risk/risk.service';
import { RiskTemplate } from '../../../core/models/RiskTemplate';

@Component({
  selector: 'app-risk-evaluation-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './risk-evaluation-summary.component.html',
  styleUrls: ['./risk-evaluation-summary.component.scss']
})
export class RiskEvaluationSummaryComponent implements OnInit, OnDestroy {
  private sub!: Subscription;

  total = 0;
  nonEvaluated = 0;
  brutOnly = 0;
  brutAndNet = 0;

  nonEvalPct = 0;
  brutPct = 0;
  brutNetPct = 0;

  constructor(private riskService: RiskService) {}

  ngOnInit() {
    this.sub = this.riskService.getAll().subscribe({
      next: (risks: RiskTemplate[]) => {
        if (!risks || !risks.length) return;

        this.total = risks.length;
        let nonEval = 0, brut = 0, brutNet = 0;

        risks.forEach(r => {
          const hasBrut = r.riskBrut && r.riskBrut.length > 0;
          const hasNet = r.riskNet && r.riskNet.length > 0;

          if (!hasBrut) nonEval++;
          else if (hasBrut && !hasNet) brut++;
          else if (hasBrut && hasNet) brutNet++;
        });

        this.nonEvaluated = nonEval;
        this.brutOnly = brut;
        this.brutAndNet = brutNet;

        this.nonEvalPct = Math.round((nonEval / this.total) * 100);
        this.brutPct = Math.round((brut / this.total) * 100);
        this.brutNetPct = Math.round((brutNet / this.total) * 100);
      },
      error: err => console.error('Erreur lors du chargement des risques', err)
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
