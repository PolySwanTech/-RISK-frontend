import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttenuationMetricsListComponent } from './attenuation-metrics-list.component';

describe('AttenuationMetricsListComponent', () => {
  let component: AttenuationMetricsListComponent;
  let fixture: ComponentFixture<AttenuationMetricsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttenuationMetricsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttenuationMetricsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
