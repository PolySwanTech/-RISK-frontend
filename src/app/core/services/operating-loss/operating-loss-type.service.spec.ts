import { TestBed } from '@angular/core/testing';

import { OperatingLossTypeService } from './operating-loss-type.service';

describe('OperatingLossTypeService', () => {
  let service: OperatingLossTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperatingLossTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
