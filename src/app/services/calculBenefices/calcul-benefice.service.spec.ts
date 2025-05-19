import { TestBed } from '@angular/core/testing';

import { CalculBeneficeService } from './calcul-benefice.service';

describe('CalculBeneficeService', () => {
  let service: CalculBeneficeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculBeneficeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
