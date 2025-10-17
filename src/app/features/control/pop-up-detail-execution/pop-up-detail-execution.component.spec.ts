import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpDetailExecutionComponent } from './pop-up-detail-execution.component';

describe('PopUpDetailExecutionComponent', () => {
  let component: PopUpDetailExecutionComponent;
  let fixture: ComponentFixture<PopUpDetailExecutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpDetailExecutionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpDetailExecutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
