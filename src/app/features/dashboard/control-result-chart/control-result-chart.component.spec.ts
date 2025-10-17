import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlResultChartComponent } from './control-result-chart.component';

describe('ControlResultChartComponent', () => {
  let component: ControlResultChartComponent;
  let fixture: ComponentFixture<ControlResultChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlResultChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlResultChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
