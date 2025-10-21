import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCompletionRateComponent } from './control-completion-rate.component';

describe('ControlCompletionRateComponent', () => {
  let component: ControlCompletionRateComponent;
  let fixture: ComponentFixture<ControlCompletionRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlCompletionRateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlCompletionRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
