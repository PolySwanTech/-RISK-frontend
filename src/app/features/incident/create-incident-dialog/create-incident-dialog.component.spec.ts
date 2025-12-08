import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIncidentDialogComponent } from './create-incident-dialog.component';

describe('CreateIncidentDialogComponent', () => {
  let component: CreateIncidentDialogComponent;
  let fixture: ComponentFixture<CreateIncidentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateIncidentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateIncidentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
