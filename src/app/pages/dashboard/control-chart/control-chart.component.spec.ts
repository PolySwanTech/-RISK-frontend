import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlChartComponent } from './control-chart.component';

describe('ControlChartComponent', () => {
  let component: ControlChartComponent;
  let fixture: ComponentFixture<ControlChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
