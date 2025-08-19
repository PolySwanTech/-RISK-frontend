import { TestBed } from '@angular/core/testing';

import { CartoService } from './carto.service';

describe('CartoService', () => {
  let service: CartoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
