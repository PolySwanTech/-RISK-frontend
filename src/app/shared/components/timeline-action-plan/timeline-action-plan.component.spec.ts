import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineActionPlanComponent } from './timeline-action-plan.component';

describe('TimelineActionPlanComponent', () => {
  let component: TimelineActionPlanComponent;
  let fixture: ComponentFixture<TimelineActionPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineActionPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineActionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
