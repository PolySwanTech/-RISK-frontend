import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAttenuationMetricsComponent } from './create-attenuation-metrics.component';

describe('CreateAttenuationMetricsComponent', () => {
  let component: CreateAttenuationMetricsComponent;
  let fixture: ComponentFixture<CreateAttenuationMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAttenuationMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAttenuationMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
