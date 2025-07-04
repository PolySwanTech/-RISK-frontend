import { TestBed } from '@angular/core/testing';

import { BaloisCategoriesService } from './balois-categories.service';

describe('BaloisCategoriesService', () => {
  let service: BaloisCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaloisCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
