import { TestBed } from '@angular/core/testing';

import { VerifierSoldeService } from './verifier-solde.service';

describe('VerifierSoldeService', () => {
  let service: VerifierSoldeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifierSoldeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
