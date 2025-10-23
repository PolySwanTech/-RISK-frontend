import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionPlanTimelinessChartComponent } from './action-plan-timeliness-chart.component';

describe('ActionPlanTimelinessChartComponent', () => {
  let component: ActionPlanTimelinessChartComponent;
  let fixture: ComponentFixture<ActionPlanTimelinessChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionPlanTimelinessChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionPlanTimelinessChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
