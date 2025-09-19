import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditButtonComponent } from './audit-button.component';

describe('AuditButtonComponent', () => {
  let component: AuditButtonComponent;
  let fixture: ComponentFixture<AuditButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
