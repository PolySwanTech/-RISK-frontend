import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsTrendChartComponent } from './incidents-trend-chart.component';

describe('IncidentsTrendChartComponent', () => {
  let component: IncidentsTrendChartComponent;
  let fixture: ComponentFixture<IncidentsTrendChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsTrendChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentsTrendChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
