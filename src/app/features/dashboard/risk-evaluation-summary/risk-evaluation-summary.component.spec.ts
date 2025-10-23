import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskEvaluationSummaryComponent } from './risk-evaluation-summary.component';

describe('RiskEvaluationSummaryComponent', () => {
  let component: RiskEvaluationSummaryComponent;
  let fixture: ComponentFixture<RiskEvaluationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskEvaluationSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskEvaluationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
