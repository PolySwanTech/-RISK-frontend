import { TestBed } from '@angular/core/testing';

import { SuiviIncidentService } from './suivi-incident.service';

describe('SuiviIncidentService', () => {
  let service: SuiviIncidentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuiviIncidentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
