import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRiskEventComponent } from './select-risk-event.component';

describe('SelectRiskEventComponent', () => {
  let component: SelectRiskEventComponent;
  let fixture: ComponentFixture<SelectRiskEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectRiskEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectRiskEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
