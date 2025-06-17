import { TestBed } from '@angular/core/testing';

import { PayementPartenaireOMService } from './payement-partenaire-om.service';

describe('PayementPartenaireOMService', () => {
  let service: PayementPartenaireOMService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayementPartenaireOMService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
