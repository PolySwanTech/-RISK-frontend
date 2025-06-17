import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRisksEvaluationsComponent } from './create-risks-evaluations.component';

describe('CreateRisksEvaluationsComponent', () => {
  let component: CreateRisksEvaluationsComponent;
  let fixture: ComponentFixture<CreateRisksEvaluationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRisksEvaluationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRisksEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
