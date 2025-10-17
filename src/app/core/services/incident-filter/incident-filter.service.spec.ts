import { TestBed } from '@angular/core/testing';

import { IncidentFilterService } from './incident-filter.service';

describe('IncidentFilterService', () => {
  let service: IncidentFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncidentFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
