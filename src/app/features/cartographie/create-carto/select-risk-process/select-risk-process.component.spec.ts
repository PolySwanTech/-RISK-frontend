import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRiskProcessComponent } from './select-risk-process.component';

describe('SelectRiskProcessComponent', () => {
  let component: SelectRiskProcessComponent;
  let fixture: ComponentFixture<SelectRiskProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectRiskProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectRiskProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
