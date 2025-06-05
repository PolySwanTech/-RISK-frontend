import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateActionPlanDialogComponent } from './create-action-plan-dialog.component';

describe('CreateActionPlanDialogComponent', () => {
  let component: CreateActionPlanDialogComponent;
  let fixture: ComponentFixture<CreateActionPlanDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateActionPlanDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateActionPlanDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
