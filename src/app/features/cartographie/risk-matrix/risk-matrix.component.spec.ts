import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskMatrixComponent } from './risk-matrix.component';

describe('RiskDetailsComponent', () => {
  let component: RiskMatrixComponent;
  let fixture: ComponentFixture<RiskMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskMatrixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
