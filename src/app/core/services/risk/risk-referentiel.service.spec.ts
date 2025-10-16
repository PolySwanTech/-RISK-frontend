import { TestBed } from '@angular/core/testing';

import { RiskReferentielService } from './risk-referentiel.service';

describe('RiskReferentielService', () => {
  let service: RiskReferentielService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RiskReferentielService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
