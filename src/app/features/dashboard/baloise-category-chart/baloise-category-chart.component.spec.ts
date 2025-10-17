import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaloiseCategoryChartComponent } from './baloise-category-chart.component';

describe('BaloiseCategoryChartComponent', () => {
  let component: BaloiseCategoryChartComponent;
  let fixture: ComponentFixture<BaloiseCategoryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaloiseCategoryChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaloiseCategoryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
