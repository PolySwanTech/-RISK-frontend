import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationBruteComponent } from './evaluation-brute.component';

describe('EvaluationBruteComponent', () => {
  let component: EvaluationBruteComponent;
  let fixture: ComponentFixture<EvaluationBruteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationBruteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationBruteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
