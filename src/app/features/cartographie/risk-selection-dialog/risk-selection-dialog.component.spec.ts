import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskSelectionDialogComponent } from './risk-selection-dialog.component';

describe('RiskSelectionDialogComponent', () => {
  let component: RiskSelectionDialogComponent;
  let fixture: ComponentFixture<RiskSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
