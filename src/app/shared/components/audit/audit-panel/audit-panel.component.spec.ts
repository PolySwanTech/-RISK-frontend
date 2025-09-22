import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditPanelComponent } from './audit-panel.component';

describe('AuditPanelComponent', () => {
  let component: AuditPanelComponent;
  let fixture: ComponentFixture<AuditPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
