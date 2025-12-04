import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionDetailDialogComponent } from './execution-detail-dialog.component';

describe('ExecutionDetailDialogComponent', () => {
  let component: ExecutionDetailDialogComponent;
  let fixture: ComponentFixture<ExecutionDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutionDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutionDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
