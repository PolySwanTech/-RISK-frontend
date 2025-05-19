import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionPlanChartComponent } from './action-plan-chart.component';

describe('ActionPlanChartComponent', () => {
  let component: ActionPlanChartComponent;
  let fixture: ComponentFixture<ActionPlanChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionPlanChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionPlanChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
