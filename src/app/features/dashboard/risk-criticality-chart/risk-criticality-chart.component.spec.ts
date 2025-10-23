import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskCriticalityChartComponent } from './risk-criticality-chart.component';

describe('RiskCriticalityChartComponent', () => {
  let component: RiskCriticalityChartComponent;
  let fixture: ComponentFixture<RiskCriticalityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskCriticalityChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskCriticalityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
