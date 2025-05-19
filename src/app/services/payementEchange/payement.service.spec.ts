import { TestBed } from '@angular/core/testing';

import { PayementEchangeService } from './payement.service';

describe('PayementService', () => {
  let service: PayementEchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayementEchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
