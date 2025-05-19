import { TestBed } from '@angular/core/testing';

import { PayementCreditService } from './payement-credit.service';

describe('PayementCreditService', () => {
  let service: PayementCreditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayementCreditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
