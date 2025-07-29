import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlEvaluationPopupComponent } from './control-evaluation-popup.component';

describe('ControlEvaluationPopupComponent', () => {
  let component: ControlEvaluationPopupComponent;
  let fixture: ComponentFixture<ControlEvaluationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlEvaluationPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlEvaluationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
