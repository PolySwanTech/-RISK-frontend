import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanifierExecutionPopupComponent } from './planifier-execution-popup.component';

describe('PlanifierExecutionPopupComponent', () => {
  let component: PlanifierExecutionPopupComponent;
  let fixture: ComponentFixture<PlanifierExecutionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanifierExecutionPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanifierExecutionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
