import { TestBed } from '@angular/core/testing';

import { AttenuationMetricsService } from './attenuation-metrics.service';

describe('AttenuationMetricsService', () => {
  let service: AttenuationMetricsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttenuationMetricsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
