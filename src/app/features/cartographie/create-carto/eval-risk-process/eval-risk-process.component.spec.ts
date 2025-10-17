import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvalRiskProcessComponent } from './eval-risk-process.component';

describe('EvalRiskProcessComponent', () => {
  let component: EvalRiskProcessComponent;
  let fixture: ComponentFixture<EvalRiskProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvalRiskProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvalRiskProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
