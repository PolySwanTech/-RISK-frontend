import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEvaluationControleComponent } from './popup-evaluation-controle.component';

describe('PopupEvaluationControleComponent', () => {
  let component: PopupEvaluationControleComponent;
  let fixture: ComponentFixture<PopupEvaluationControleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupEvaluationControleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEvaluationControleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
