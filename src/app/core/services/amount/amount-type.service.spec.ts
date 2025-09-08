import { TestBed } from '@angular/core/testing';

import { AmountTypeService } from './amount-type.service';

describe('AmountTypeService', () => {
  let service: AmountTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmountTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
