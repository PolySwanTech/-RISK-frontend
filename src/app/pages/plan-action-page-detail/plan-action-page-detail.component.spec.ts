import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanActionPageDetailComponent } from './plan-action-page-detail.component';

describe('PlanActionPageDetailComponent', () => {
  let component: PlanActionPageDetailComponent;
  let fixture: ComponentFixture<PlanActionPageDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanActionPageDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanActionPageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
