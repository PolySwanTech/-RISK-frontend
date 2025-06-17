import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskDetailComponent } from './risk-detail.component';

describe('RiskDetailComponent', () => {
  let component: RiskDetailComponent;
  let fixture: ComponentFixture<RiskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
