import { TestBed } from '@angular/core/testing';

import { OperatingLossService } from './operating-loss.service';

describe('ImpactService', () => {
  let service: OperatingLossService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperatingLossService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
