import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskEvaluationComponent } from './risk-evaluation.component';

describe('RiskEvaluationComponent', () => {
  let component: RiskEvaluationComponent;
  let fixture: ComponentFixture<RiskEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskEvaluationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
