import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationNetteComponent } from './evaluation-nette.component';

describe('EvaluationNetteComponent', () => {
  let component: EvaluationNetteComponent;
  let fixture: ComponentFixture<EvaluationNetteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationNetteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationNetteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
