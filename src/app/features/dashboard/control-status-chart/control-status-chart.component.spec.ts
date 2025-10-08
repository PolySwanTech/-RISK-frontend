import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStatusChartComponent } from './control-status-chart.component';

describe('ControlStatusChartComponent', () => {
  let component: ControlStatusChartComponent;
  let fixture: ComponentFixture<ControlStatusChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlStatusChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlStatusChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
